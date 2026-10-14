# Custom min-heap
# Time: O(N log K)

def _swap(heap, i, j):
    heap[i], heap[j] = heap[j], heap[i]


def _sift_up(heap, idx):
    # bubble new element up until heap property is restored
    while idx > 0:
        parent = (idx - 1) // 2
        if heap[idx][0] < heap[parent][0]:
            _swap(heap, idx, parent)
            idx = parent
        else:
            break

def _sift_down(heap, idx, size):
    # push root down after removal
    while True:
        smallest = idx
        left = 2 * idx + 1
        right = 2 * idx + 2
        if left < size and heap[left][0] < heap[smallest][0]:
            smallest = left
        if right < size and heap[right][0] < heap[smallest][0]:
            smallest = right
        if smallest == idx:
            break
        _swap(heap, idx, smallest)
        idx = smallest


def _heap_push(head, item):
    heap.append(item)
    _sift_up(head, len(heap) -1)

def _heap_pop(heap):
    # remove and return the minimum (root)
    if len(heap) == 1:
        return heap.pop()
    root = heap[0]
    heap[0] = head.pop()
    _sift_down(heap, 0, len(heap))
    return root

def top_k(data: list[tuple], k: int) -> list[tuple]:
    """Return top-k (zone_id, value) pairs sorted descending by value."""
    if k <= 0:
        return []
    heap: list[tuple] = []

    for zone_id, value in data:
        if len(heap) < k:
            _heap_push(heap, (value, zone_id))
        elif value > heap[0][0]:
            _heap_pop(heap)
            _heap_push(heap, (value, zone_id))

    result = []
    while heap:
        result.append(_heap_pop(heap))

    result.reverse()
    return [(zone_id, value) for value, zone_id in result]
