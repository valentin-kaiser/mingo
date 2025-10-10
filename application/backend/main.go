package main

import (
	"embed"
	"fmt"
	"io/fs"

	"github.com/rs/zerolog"
	"github.com/valentin-kaiser/go-core/flag"
	"github.com/valentin-kaiser/go-core/logging"
	"github.com/valentin-kaiser/go-core/logging/log"
	"github.com/valentin-kaiser/go-core/version"
	"github.com/valentin-kaiser/go-core/web"
	"github.com/valentin-kaiser/go-core/zlog"
)

var (
	loglevel int    = 1
	port     uint16 = 8080
	//go:embed static
	static embed.FS
)

func init() {
	flag.Register("port", &port, "Port to listen on")
	flag.Register("loglevel", &loglevel, "Log level (-1=trace, 0=debug, 1=info, 2=warn, 3=error, 4=fatal, 5=panic)")

	flag.Init()
}

func main() {
	zlog.Logger().WithConsole().WithLogFile().Init("mingo", zerolog.Level(loglevel))
	logging.SetGlobalAdapter(logging.NewZerologAdapter().SetLevel(logging.Level(loglevel)))
	logging.Debug(flag.Debug)

	log.Info().Msgf("=== Mingo %s ===", version.String())
	if flag.Debug {
		log.Debug().Msg("running in debug mode")
		log.Debug().Msgf("data path: %s", flag.Path)
		log.Debug().Msgf("git tag: %s", version.GitTag)
		log.Debug().Msgf("git commit: %s", version.GitCommit)
		log.Debug().Msgf("git short: %s", version.GitShort)
		log.Debug().Msgf("build date: %s", version.BuildDate)
		log.Debug().Msgf("runtime version: %s %s", version.GoVersion, version.Platform)

		for _, mod := range version.Modules {
			log.Debug().Msgf("module => %s %s %s", mod.Path, mod.Version, mod.Sum)
		}
	}

	if flag.Help {
		flag.PrintHelp()
		return
	}

	if flag.Version {
		fmt.Print(version.String())
		return
	}

	files, err := fs.Sub(static, "static")
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load static files")
	}

	err = web.New().WithPort(port).WithCORSHeaders().WithGzip().WithLog().WithFS([]string{"/"}, files).Start().Error
	if err != nil {
		log.Fatal().Err(err).Msg("failed to start web server")
	}
}
