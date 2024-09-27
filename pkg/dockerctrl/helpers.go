package dockerctrl

import (
	"os"

	"github.com/docker/docker/api/types/mount"
)

func ensureMountPaths(mounts []mount.Mount) {
  for _, m := range mounts {
    if m.Type == mount.TypeBind {
      p := m.Source
      if _, err := os.Stat(p); os.IsNotExist(err) {
        os.MkdirAll(p, 0755)
      }
    }
  }
}
