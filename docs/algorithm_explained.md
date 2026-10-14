# Algorithm: Custom Top-K Using a Min-Heap

## Problem Statement

Given the full set of NYC taxi pickup zones (up to 265 zones), identify the
K zones with the highest trip volume without using any built-in sorting or
ranking library (`heapq`, `sorted`, `sort_values`, `Counter`, etc.).

## Why This Matters

The dashboard's "Top 10 Pickup Zones" chart must rank zones by trip count.
The naïve approach - sort all zones then slice - is O(N log N). When K is
small relative to N (e.g. top-10 from 265 zones), a min-heap of size K
achieves O(N log K), which is both faster and demonstrates genuine
algorithmic understanding.

## Data Structure: Min-Heap of Size K

A min-heap is a complete binary tree where every parent node is ≤ its
children. The root is always the minimum element. By maintaining a heap of
exactly K elements, we ensure:

- Any new element larger than the current minimum displaces it.
- The heap never grows beyond K, so memory is O(K).

## Pseudo-code

```
function top_k(data, k):
    heap = []                          

    for each (zone_id, value) in data:
        if len(heap) < k:
            heap_push(heap, (value, zone_id))
        else if value > heap[0].value:     
            heap_pop(heap)
            heap_push(heap, (value, zone_id))

    result = []
    while heap is not empty:
        result.append(heap_pop(heap))

    reverse(result)                    
    return result
```

## Heap Primitives (manually implemented)

### sift_up  - after insertion
```
function sift_up(heap, idx):
    while idx > 0:
        parent = (idx - 1) / 2
        if heap[idx].value < heap[parent].value:
            swap(heap, idx, parent)
            idx = parent
        else:
            break
```

### sift_down  - after root removal
```
function sift_down(heap, idx, size):
    loop:
        smallest = idx
        left  = 2*idx + 1
        right = 2*idx + 2
        if left  < size and heap[left].value  < heap[smallest].value: smallest = left
        if right < size and heap[right].value < heap[smallest].value: smallest = right
        if smallest == idx: break
        swap(heap, idx, smallest)
        idx = smallest
```

## Complexity Analysis

| Operation      | Time         | Space |
|----------------|--------------|-------|
| heap_push      | O(log K)     | —     |
| heap_pop       | O(log K)     | —     |
| Full top_k run | O(N log K)   | O(K)  |

For N = 265 zones, K = 10:
- Heap approach : 265 × log₂(10) ≈ 265 × 3.32 ≈ **880 operations**
- Sort approach : 265 × log₂(265) ≈ 265 × 8.05 ≈ **2,133 operations**

The heap is ~2.4× fewer comparisons — and the gap widens as N grows.

## Where It Is Used

- `backend/algorithms/top_k.py` -> Python implementation
- `backend/api/routes/stats.py` -> `/api/stats/top-zones` endpoint calls `top_k()`
- `frontend/assets/js/sort.js` -> insertion sort (O(n²), O(1) space) for
  client-side table sorting, chosen because n ≤ 1000 rows and in-place
  sorting avoids allocating a second array.