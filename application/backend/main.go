package main

import (
	"embed"
	"fmt"
	"io/fs"
	"path/filepath"

	"github.com/valentin-kaiser/go-core/apperror"
	"github.com/valentin-kaiser/go-core/flag"
	"github.com/valentin-kaiser/go-core/interruption"
	"github.com/valentin-kaiser/go-core/logging"
	"github.com/valentin-kaiser/go-core/logging/log"
	"github.com/valentin-kaiser/go-core/version"
	"github.com/valentin-kaiser/go-core/web"
)

var (
	loglevel int    = 1
	port     uint16 = 8080
	//go:embed static
	static embed.FS
)

func main() {
	defer interruption.Catch()
	interruption.Write = true

	logging.Anonymous(true)
	apperror.Anonymous(true)
	apperror.ErrorHandler = func(err error, msg string) {
		log.Error().Err(err).Msg(msg)
	}

	flag.Register("port", &port, "Port to listen on")
	flag.Register("loglevel", &loglevel, "Log level (-1=trace, 0=debug, 1=info, 2=warn, 3=error, 4=fatal, 5=panic)")

	flag.Init()

	logging.SetGlobalAdapter(logging.
		NewZerologAdapter().
		WithConsole().
		WithFileRotation(filepath.Join(flag.Path, "logs", "mingo.log"), 10, 30, 30, true).
		WithStream(200).
		SetLevel(logging.Level(loglevel)))

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

	err = web.New().
		WithPort(port, web.ProtocolHTTP).
		WithCORSHeaders(&web.CORSConfig{
			AllowOrigin:  "*",
			AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowHeaders: []string{"Content-Type"},
		}).WithSecurityHeaders().
		WithGzip().
		WithLog().
		WithFS([]string{"/"}, files).
		Start().Error
	if err != nil {
		log.Fatal().Err(err).Msg("failed to start web server")
	}
}
