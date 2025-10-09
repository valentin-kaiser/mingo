package main

import (
	"embed"

	"github.com/valentin-kaiser/go-core/flag"
	"github.com/valentin-kaiser/go-core/web"
)

var (
	port uint16 = 8080
	//go:embed index.html
	index embed.FS
)

func init() {
	flag.Register("port", &port, "Port to listen on")
}

func main() {
	err := web.New().WithPort(port).WithCORSHeaders().WithGzip().WithLog().WithFS([]string{"/"}, index).Start().Error
	if err != nil {
		panic(err)
	}
}
