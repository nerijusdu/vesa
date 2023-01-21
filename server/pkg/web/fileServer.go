package web

import (
	"embed"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
)

func fileServer(r chi.Router, path string, content embed.FS) {
	root, err := fs.Sub(content, "public")
	if err != nil {
		panic(err)
	}
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", http.StatusMovedPermanently).ServeHTTP)
		path += "/"
	}
	path += "*"
	publicPath := "public"
	index, err := content.ReadFile(filepath.Join(publicPath, "index.html"))
	if err != nil {
		panic(err)
	}

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
		w.Write(index)
	})

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		f, err := content.Open(filepath.Join(publicPath, r.URL.Path))
		if os.IsNotExist(err) {
			w.WriteHeader(http.StatusAccepted)
			w.Write(index)
			return
		} else if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer f.Close()

		http.FileServer(http.FS(root)).ServeHTTP(w, r)
	})
}
