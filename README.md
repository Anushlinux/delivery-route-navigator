# DeliveryRoute Navigator

A comprehensive web application for visualizing and solving the Traveling Salesperson Problem (TSP). This project demonstrates different algorithms for finding the optimal route between multiple destinations.

## Overview

DeliveryRoute Navigator allows users to place delivery points on an interactive map and calculate the most efficient route between them. The application showcases three different algorithms with varying performance characteristics, providing an educational and practical tool for understanding computational complexity and route optimization.

## Features

- **Interactive Map Interface**
  - Add locations by searching addresses or clicking directly on the map.

- **Multiple Algorithms**
  - Choose between Brute Force (exact), Nearest Neighbor (fast), and 2-Opt Heuristic (balanced) approaches.

- **Real-time Visualization**
  - Watch the calculated route animate on the map with directional indicators.

- **Step-by-Step Algorithm Playback**
  - See exactly how each algorithm makes decisions.

- **Performance Metrics**
  - Compare algorithm execution time, total distance, and iteration counts.

- **Route Details**
  - View comprehensive information about the calculated route, including distances between stops.

- **Responsive Design**
  - Works seamlessly across different device sizes.

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui with Tailwind CSS
- **Map Visualization**: Leaflet with custom styling and animations
- **Geocoding**: Address search functionality
- **State Management**: React Hooks and Context
- **Routing**: React Router

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/delivery-route-navigator.git

# Navigate to project directory
cd delivery-route-navigator

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage Guide

### Adding Locations

- **Search Method**
  - Enter an address or place name in the search bar and click Search.

- **Click Method**
  - Click directly on the map to add a location at that point.

- **Manage Locations**
  - View all added locations in the list below the search bar; remove individual locations as needed.

### Selecting an Algorithm

Choose from three algorithm options:

- **Brute Force**
  - Guarantees the optimal solution by checking every possible route
  - Perfect for small datasets (≤ 10 locations)
  - Extremely slow for larger datasets due to factorial time complexity

- **Nearest Neighbor**
  - A greedy algorithm that always chooses the closest unvisited location
  - Very fast even with many locations
  - Results can be suboptimal (20-30% longer than optimal)

- **2-Opt Heuristic**
  - Improves an initial route by swapping connections to eliminate crossings
  - Good balance between speed and route quality
  - Can get stuck in local optima

### Visualizing the Solution

- Click **Calculate Optimal Route** to execute the selected algorithm.
- The route will animate on the map, showing the order of visits.
- Use the playback controls to step through the algorithm's decision-making process.
- View performance metrics to understand execution time and computational efficiency.

## Understanding the Traveling Salesperson Problem

> "Given a list of cities and the distances between each pair, what is the shortest possible route that visits each city exactly once and returns to the origin?"

This problem is classified as NP-hard, meaning:

- For small inputs, it can be solved exactly.
- As the number of locations increases, the complexity grows factorially.
- For large inputs, approximation algorithms become necessary.

## Algorithm Explanations

### Brute Force
- **Approach**: Evaluates every possible permutation of visits
- **Time Complexity**: O(n!) – factorial growth
- **Use Case**: Small problems where the absolute optimal solution is required
- **Implementation**: Recursive algorithm with backtracking

### Nearest Neighbor
- **Approach**: Always selects the closest unvisited location
- **Time Complexity**: O(n²) – quadratic growth
- **Use Case**: Large problems where a quick approximation is acceptable
- **Implementation**: Greedy algorithm with local optimization

### 2-Opt Heuristic
- **Approach**: Starts with an initial solution and iteratively improves by swapping connections
- **Time Complexity**: O(n²) per iteration, typically needs multiple iterations
- **Use Case**: Problems where balance between quality and performance is desired
- **Implementation**: Local search algorithm that removes route crossings

## Performance Considerations

- **Location Count Warning**: The application will warn you when using Brute Force with more than 10 locations, as this can cause significant performance issues.
- **Mobile Performance**: Complex route calculations may be slower on mobile devices.
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge) provide the best experience.

## Future Improvements

- Additional algorithms (Genetic Algorithms, Simulated Annealing, Ant Colony Optimization)
- Export/import of location datasets
- Route saving and sharing functionality
- Distance matrix visualization
- 3D visualization of solution space

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request:

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m "Add some amazing feature"
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## License

This project is licensed under the MIT License – see the LICENSE file for details.

*Created with ❤️ for algorithm enthusiasts and logistics professionals alike.*
