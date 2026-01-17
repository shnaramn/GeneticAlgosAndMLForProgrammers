// Basic algorithm
generation = random_tries()
for a while:
    generation = get_better(generation)

// Refined
generation = random_tries()
for a while:
    generation = crossover(generation)
    mutate(generation)
