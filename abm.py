import numpy as np
import random
from scipy.stats import gamma

# Cell states
HEALTHY = 'h'
ECLIPSE = 'e'
INFECTED = 'i'
DEAD = 'd'
FUSED = 'f'
EMPTY = 'o'

"""  
The gamma distribution is a probability distribution used to model 
positive, continuous random variables, such as waiting times or 
durations. In aour case, it is used to assign random durations for the eclipse 
phase (time from infection to becoming infectious) and infection phase (time a cell produces virus before dying). 
This introduces biological variability, as real cells do not all follow identical timing due to 
differences in viral replication or cell response.
"""
class ViralABM:
    def __init__(self, layers, probi=0.2, fusion_prob=0.05, timestep=0.005, end_time=48, tau_e=6.0, tau_i=12.0, ne=30.0, ni=100.0, initial_infected=1):
        self.layers = layers
        self.grid_size = 2 * layers - 1
        self.grid = np.full((self.grid_size, self.grid_size), EMPTY, dtype=str)
        self.eclipse_times = np.zeros((self.grid_size, self.grid_size))
        self.infection_times = np.zeros((self.grid_size, self.grid_size))
        self.healthy_times = np.zeros((self.grid_size, self.grid_size))
        self.universal_times = np.zeros((self.grid_size, self.grid_size))
        self.PROBI = probi
        self.FUSION_PROB = fusion_prob
        self.TIMESTEP = timestep
        self.END_TIME = end_time
        self.TAU_E = tau_e #mean duration of eclipse state, so this is when a cell is infected but not producing virus YET
        self.TAU_I = tau_i
        self.NE = ne
        self.NI = ni
        self.INITIAL_INFECTED = initial_infected
        self.initialize_grid()
        self.initialize_infected()

    def initialize_grid(self):
        radius = self.layers - 1
        center = self.grid_size // 2
        num_cells = 0
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                di = i - center
                dj = j - center
                dist = np.sqrt(di**2 + dj**2)
                if dist <= radius: #checking whether a cell at position (i,j) is within a certain distance from the center of the grid
                    self.grid[i, j] = HEALTHY
                    self.eclipse_times[i, j] = gamma.rvs(self.NE, scale=self.TAU_E/self.NE)
                    self.infection_times[i, j] = gamma.rvs(self.NI, scale=self.TAU_I/self.NI)
                    num_cells += 1
        return num_cells

    #As the function is titled, we start with one infected hexagon...
    def initialize_infected(self):
        #creating a list of all grid coordinates where cells are healthy
        healthy_cells = [(i, j) for i in range(self.grid_size) for j in range(self.grid_size) if self.grid[i, j] == HEALTHY]
        infected = random.sample(healthy_cells, min(self.INITIAL_INFECTED, len(healthy_cells)))
        for i, j in infected:
            self.grid[i, j] = ECLIPSE
            #now we can set how long it will be in the eclipse state before it infects
            self.eclipse_times[i, j] = gamma.rvs(self.NE, scale=self.TAU_E/self.NE)

    #collects a list of the 6 possible neighbour cells and filters out the ones that are outside tour grid bounds or are makred empty
    def get_neighbors(self, i, j):
        neighbors = [
            (i-1, j), (i+1, j), (i, j-1), (i, j+1), (i-1, j+1), (i+1, j-1)
        ]
        return [(ni, nj) for ni, nj in neighbors
                if 0 <= ni < self.grid_size and 0 <= nj < self.grid_size and self.grid[ni, nj] != EMPTY]

    """ 
    We make copies of the states below to ensure that all updates
    happen on the current state, and only after the step is done,
    we assing these new steps back to the grid. The assigining can
    be found at the end of this function
    """
    def step(self):
        new_grid = self.grid.copy()
        new_ecl = self.eclipse_times.copy()
        new_inf = self.infection_times.copy()
        infected_cells = [(i, j) for i in range(self.grid_size) for j in range(self.grid_size) if self.grid[i, j] == INFECTED]

        # Update healthy cells
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if self.grid[i, j] == HEALTHY:
                    self.healthy_times[i, j] += self.TIMESTEP
                    if random.random() < self.PROBI * self.TIMESTEP:
                        neighbors = self.get_neighbors(i, j)
                        infected_neighbors = [n for n in neighbors if self.grid[n[0], n[1]] == INFECTED]
                        if infected_neighbors:
                            new_grid[i, j] = ECLIPSE
                            new_ecl[i, j] = gamma.rvs(self.NE, scale=self.TAU_E/self.NE)

        # Update eclipse cells
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if self.grid[i, j] == ECLIPSE:
                    if self.universal_times[i, j] > (self.eclipse_times[i, j] + self.healthy_times[i, j]):
                        new_grid[i, j] = INFECTED
                        new_inf[i, j] = gamma.rvs(self.NI, scale=self.TAU_I/self.NI)

        # Update infected cells
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if self.grid[i, j] == INFECTED:
                    if self.universal_times[i, j] > (self.infection_times[i, j] + self.eclipse_times[i, j] + self.healthy_times[i, j]):
                        new_grid[i, j] = DEAD

        # Stochastic fusion
        fused_pairs = set()
        random.shuffle(infected_cells)
        for i, j in infected_cells:
            if (i, j) in fused_pairs:
                continue
            neighbors = self.get_neighbors(i, j)
            infected_neighbors = [(ni, nj) for ni, nj in neighbors if self.grid[ni, nj] == INFECTED and (ni, nj) not in fused_pairs]
            if infected_neighbors and random.random() < self.FUSION_PROB * self.TIMESTEP:
                ni, nj = random.choice(infected_neighbors)
                new_grid[i, j] = FUSED
                new_grid[ni, nj] = FUSED
                fused_pairs.add((i, j))
                fused_pairs.add((ni, nj))
                new_inf[i, j] = gamma.rvs(self.NI, scale=self.TAU_I/self.NI * 1.5)
                new_inf[ni, nj] = new_inf[i, j]

        # Update fused cells
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if self.grid[i, j] == FUSED:
                    if self.universal_times[i, j] > (self.infection_times[i, j] + self.eclipse_times[i, j] + self.healthy_times[i, j]):
                        new_grid[i, j] = DEAD

        self.grid = new_grid
        self.eclipse_times = new_ecl
        self.infection_times = new_inf
        self.universal_times += self.TIMESTEP

    def get_state(self, time):
        counts = {HEALTHY: 0, ECLIPSE: 0, INFECTED: 0, DEAD: 0, FUSED: 0}
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if self.grid[i, j] in counts:
                    counts[self.grid[i, j]] += 1
        return {
            'time': time,
            'grid': self.grid.tolist(),
            'counts': counts
        }

    def run_to_time(self, target_time):
        steps = int(target_time / self.TIMESTEP)
        current_step = int(self.universal_times[0, 0] / self.TIMESTEP)
        for _ in range(current_step, steps):
            self.step()
        return self.get_state(target_time)