package util

func Map[T any, R any](arr []T, fn func(T) R) []R {
	if arr == nil {
		return nil
	}

	b := make([]R, len(arr))
	for i, v := range arr {
		b[i] = fn(v)
	}
	return b
}

func Sort[T any](arr []T, fn func(T, T) bool) {
	if arr == nil {
		return
	}

	for i := 0; i < len(arr); i++ {
		for j := i + 1; j < len(arr); j++ {
			if fn(arr[i], arr[j]) {
				arr[i], arr[j] = arr[j], arr[i]
			}
		}
	}
}