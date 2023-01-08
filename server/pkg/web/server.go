package web

import (
	"flag"
	"log"
	"net/http"
)

func ServeFiles() {
	port := flag.String("p", "8100", "port to serve on")
	directory := "public"
	flag.Parse()

	http.Handle("/", http.FileServer(http.Dir(directory)))

	log.Printf("Serving web GUI on port: %s\n", *port)
	log.Fatal(http.ListenAndServe(":"+*port, nil))
}
