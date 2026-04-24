import { NextRequest, NextResponse } from 'next/server';

type Edge = {
  p: string;
  c: string;
  original: string;
};

type Hierarchy = {
  root: string;
  tree: any;
  depth?: number;
  has_cycle?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }

    const userId = 'nihal_24042026';
    const emailId = 'nihal@example.edu';
    const rollNumber = 'SRM2026001';

    const invalidEntries: string[] = [];
    const duplicateEdgesSet = new Set<string>();
    const seenEdges = new Set<string>();
    const validEdges: Edge[] = [];
    const allNodes = new Set<string>();

    // 1. Validation and Duplicate detection
    data.forEach((entry: any) => {
      if (typeof entry !== 'string') {
        invalidEntries.push(String(entry));
        return;
      }

      const trimmed = entry.trim();
      const match = trimmed.match(/^([A-Z])->([A-Z])$/);

      if (!match) {
        invalidEntries.push(trimmed);
        return;
      }

      const [_, p, c] = match;

      if (p === c) {
        invalidEntries.push(trimmed); // Self-loop
        return;
      }

      if (seenEdges.has(trimmed)) {
        duplicateEdgesSet.add(trimmed);
        return;
      }

      seenEdges.add(trimmed);
      validEdges.push({ p, c, original: trimmed });
      allNodes.add(p);
      allNodes.add(c);
    });

    // 2. Multi-parent rule and Effective Graph Construction
    const effectiveAdj = new Map<string, string[]>();
    const childToParent = new Map<string, string>();
    const parentInDegree = new Map<string, number>();

    validEdges.forEach(({ p, c }) => {
      if (childToParent.has(c)) {
        // Discard multi-parent edge
        return;
      }
      childToParent.set(c, p);
      if (!effectiveAdj.has(p)) effectiveAdj.set(p, []);
      effectiveAdj.get(p)!.push(c);
      
      parentInDegree.set(c, (parentInDegree.get(c) || 0) + 1);
      if (!parentInDegree.has(p)) parentInDegree.set(p, 0);
    });

    // Also ensure all nodes are in parentInDegree
    allNodes.forEach(node => {
        if (!parentInDegree.has(node)) parentInDegree.set(node, 0);
    });

    // 3. Components Finding (Weakly Connected)
    // We'll use Union-Find on the effective edges
    const parent = new Map<string, string>();
    function find(i: string): string {
      if (!parent.has(i)) parent.set(i, i);
      if (parent.get(i) === i) return i;
      const root = find(parent.get(i)!);
      parent.set(i, root);
      return root;
    }

    function union(i: string, j: string) {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) parent.set(rootI, rootJ);
    }

    // Connect nodes that have edges between them in the effective graph
    for (const [p, children] of effectiveAdj.entries()) {
      children.forEach(c => union(p, c));
    }

    // Group nodes by component root
    const components = new Map<string, string[]>();
    allNodes.forEach(node => {
      const root = find(node);
      if (!components.has(root)) components.set(root, []);
      components.get(root)!.push(node);
    });

    const hierarchies: Hierarchy[] = [];
    let totalTrees = 0;
    let totalCycles = 0;
    let maxDepth = -1;
    let largestTreeRoot = '';

    // 4. Process each component
    components.forEach((nodes, compRoot) => {
      // Find roots in this component (nodes with in-degree 0 in effective graph)
      const compRoots = nodes.filter(n => (parentInDegree.get(n) || 0) === 0).sort();
      
      let actualRoot: string;
      let hasCycle = false;

      if (compRoots.length > 0) {
        // If multiple roots exist in one component? 
        // This shouldn't happen in a truly connected component where each node has <= 1 parent.
        // But if it does, we treat the smallest as the "main" root or maybe they are separate?
        // Wait, if A->B and C->D are separate, they have separate compRoots.
        // If they are in the same component, they must be connected.
        // If each node has <= 1 parent, a component is either a Tree or a Cycle with trees hanging off it.
        // If it's a tree, it has exactly one node with in-degree 0.
        actualRoot = compRoots[0];
      } else {
        // Pure cycle
        actualRoot = nodes.sort()[0];
        hasCycle = true;
      }

      // Cycle detection and Tree building
      const visited = new Set<string>();
      const recStack = new Set<string>();
      
      function checkCycle(node: string): boolean {
        visited.add(node);
        recStack.add(node);
        const children = effectiveAdj.get(node) || [];
        for (const child of children) {
          if (!visited.has(child)) {
            if (checkCycle(child)) return true;
          } else if (recStack.has(child)) {
            return true;
          }
        }
        recStack.delete(node);
        return false;
      }

      if (!hasCycle) {
        hasCycle = checkCycle(actualRoot);
      }

      if (hasCycle) {
        hierarchies.push({
          root: actualRoot,
          tree: {},
          has_cycle: true
        });
        totalCycles++;
      } else {
        // Build nested tree
        function buildTree(node: string): any {
          const res: any = {};
          const children = (effectiveAdj.get(node) || []).sort();
          children.forEach(c => {
            res[c] = buildTree(c);
          });
          return res;
        }

        const treeObj: any = {};
        treeObj[actualRoot] = buildTree(actualRoot);

        // Depth calculation
        function getDepth(node: string): number {
          const children = effectiveAdj.get(node) || [];
          if (children.length === 0) return 1;
          return 1 + Math.max(...children.map(c => getDepth(c)));
        }

        const depth = getDepth(actualRoot);
        hierarchies.push({
          root: actualRoot,
          tree: treeObj,
          depth
        });
        totalTrees++;

        if (depth > maxDepth) {
          maxDepth = depth;
          largestTreeRoot = actualRoot;
        } else if (depth === maxDepth) {
          if (actualRoot < largestTreeRoot) {
            largestTreeRoot = actualRoot;
          }
        }
      }
    });

    // Sort hierarchies by root lexicographically
    hierarchies.sort((a, b) => a.root.localeCompare(b.root));

    const response = {
      user_id: userId,
      email_id: emailId,
      college_roll_number: rollNumber,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: Array.from(duplicateEdgesSet),
      summary: {
        total_trees: totalTrees,
        total_cycles: totalCycles,
        largest_tree_root: largestTreeRoot
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
