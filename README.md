# Mingo 🎯

**Math Bingo** - An interactive web application for practicing arithmetic skills through engaging bingo-style gameplay.

## Overview

Mingo is a modern, web-based math learning tool that combines the fun of bingo with essential arithmetic practice. Students can practice multiplication tables and basic operations (addition, subtraction, multiplication, division) in an engaging, game-like environment.

### Features

- **Interactive Bingo Game**: Practice math problems in a fun bingo format
- **Customizable Difficulty**: Adjust settings for different skill levels
- **Multiple Operations**: Support for addition, subtraction, multiplication, and division
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Modern UI with theme support
- **Progress Tracking**: Local storage keeps track of completed problems
- **Real-time Feedback**: Immediate validation of answers

## Quick Start

### Prerequisites

- Go 1.24.5 or later
- Git

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/valentin-kaiser/mingo.git
   cd mingo
   ```

2. **Run the application**
   ```bash
   go run main.go
   ```

3. **Open your browser**
   Navigate to `http://localhost:8080`

### Command Line Options

```bash
go run main.go [options]

Options:
  --port        Port to listen on (default: 8080)
  --loglevel    Log level (-1=trace, 0=debug, 1=info, 2=warn, 3=error, 4=fatal, 5=panic) (default: 1)
  --help        Show help information
  --version     Show version information
```

## Docker Support

### Build and run with Docker

```bash
# Build the Docker image
docker build -t mingo .

# Run the container
docker run -p 8080:8080 mingo
```

The application includes a health check endpoint for container orchestration.

## How to Play

1. **Start the Game**: Open the application in your web browser
2. **Configure Settings**: Adjust difficulty level and operation types
3. **Solve Problems**: Click on math expressions to reveal answers
4. **Get Bingo**: Complete rows, columns, or diagonals to win
5. **Reset**: Start over with new problems anytime

## Architecture

- **Backend**: Go web server with embedded static files
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Logging**: Structured logging with configurable levels
- **Storage**: Browser local storage for progress persistence

## Development

### Project Structure

```
mingo/
├── main.go          # Main Go application
├── index.html       # Frontend application
├── go.mod          # Go module dependencies
├── Dockerfile      # Container configuration
└── data/           # Application data and logs
    └── mingo.log   # Application logs
```

### Dependencies

The project uses minimal dependencies:
- `github.com/rs/zerolog` - Structured logging
- `github.com/valentin-kaiser/go-core` - Core utilities for web server, logging, and configuration

### Building from Source

```bash
# Download dependencies
go mod tidy

# Build binary
go build -o mingo main.go

# Run
./mingo
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is available under the terms specified in the repository.

## Author

[Valentin Kaiser](https://github.com/valentin-kaiser)

---

*Made with ❤️ for math education*
