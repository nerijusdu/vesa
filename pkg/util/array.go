package util

func Find[T any](arr []T, fn func(T) bool) (T, bool) {
	var res T
	if arr == nil {
		return res, false
	}

	for _, v := range arr {
		if fn(v) {
			return v, true
		}
	}

	return res, false
}

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

func MapDict[T any, K comparable, R any](dict map[K]T, fn func(T) R) map[K]R {
	if dict == nil {
		return nil
	}

	b := make(map[K]R)
	for k, v := range dict {
		b[k] = fn(v)
	}
	return b
}
