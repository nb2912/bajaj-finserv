const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Helper function to validate node format X->Y
const isValidNode = (entry) => {
    const trimmed = entry.trim();
    if (!trimmed) return false;
    const parts = trimmed.split('->');
    if (parts.length !== 2) return false;
    const [p, c] = parts;
    if (p.length !== 1 || c.length !== 1) return false;
    if (p < 'A' || p > 'Z' || c < 'A' || c > 'Z') return false;
    if (p === c) return false; // Self-loop treated as invalid
    return { p, c, original: trimmed };
};

app.post('/bfhl', (req, res) => {
    try {
        const { data } = req.body;
        if (!Array.isArray(data)) {
            return res.status(400).json({ is_success: false, message: "Invalid input format. 'data' must be an array." });
        }

        const invalid_entries = [];
        const duplicate_edges = [];
        const seen_edges = new Set();
        const valid_edges = [];
        const child_to_parent = {}; // To handle multi-parent (first wins)

        data.forEach(entry => {
            const validation = isValidNode(entry);
            if (!validation) {
                invalid_entries.push(entry);
                return;
            }

            const edgeKey = `${validation.p}->${validation.c}`;
            if (seen_edges.has(edgeKey)) {
                if (!duplicate_edges.includes(edgeKey)) {
                    duplicate_edges.push(edgeKey);
                }
                return;
            }
            seen_edges.add(edgeKey);

            // Rule: Multi-parent case - first parent encountered wins
            if (child_to_parent[validation.c]) {
                // Silently discard subsequent parents
                return;
            }
            child_to_parent[validation.c] = validation.p;
            valid_edges.push({ p: validation.p, c: validation.c });
        });

        // Group management
        const nodes = new Set();
        const adj = {};
        valid_edges.forEach(({ p, c }) => {
            nodes.add(p);
            nodes.add(c);
            if (!adj[p]) adj[p] = [];
            adj[p].push(c);
        });

        // Find connected components (groups)
        // Since it's a directed graph with multi-parent rule applied, 
        // each node has at most 1 parent. This makes it a collection of trees and cycles.
        const visited = new Set();
        const groups = [];

        const allNodesArr = Array.from(nodes).sort();
        
        allNodesArr.forEach(node => {
            if (!visited.has(node)) {
                const groupNodes = new Set();
                const stack = [node];
                // Since multi-parent rule makes in-degree <= 1, we can find the "root" of this component
                // by following parents up.
                
                let current = node;
                const path = new Set();
                while (child_to_parent[current] && !path.has(current)) {
                    path.add(current);
                    current = child_to_parent[current];
                }
                
                // Now 'current' is either a root or part of a cycle
                const componentStack = [current];
                const componentNodes = new Set();
                while (componentStack.length > 0) {
                    const n = componentStack.pop();
                    if (!componentNodes.has(n)) {
                        componentNodes.add(n);
                        visited.add(n);
                        if (adj[n]) {
                            adj[n].forEach(child => componentStack.push(child));
                        }
                        // Also add children from the parent perspective if any (though unlikely due to how we picked 'current')
                    }
                }
                
                // Ensure all nodes in the component are found (in case 'current' wasn't the absolute root for all)
                // Actually, with in-degree <= 1, following parents leads to the ONLY possible root or cycle.
                groups.push(Array.from(componentNodes).sort());
            }
        });

        const hierarchies = [];
        let total_trees = 0;
        let total_cycles = 0;
        let maxDepth = -1;
        let largest_tree_root = "";

        groups.forEach(groupNodes => {
            // Find root: node with no parent in this group
            let groupRoot = null;
            groupNodes.sort().forEach(n => {
                if (!child_to_parent[n]) {
                    if (groupRoot === null) groupRoot = n;
                }
            });

            const has_cycle = (rootNode) => {
                const visitedSearch = new Set();
                const recStack = new Set();
                const check = (n) => {
                    visitedSearch.add(n);
                    recStack.add(n);
                    if (adj[n]) {
                        for (const child of adj[n]) {
                            if (!visitedSearch.has(child)) {
                                if (check(child)) return true;
                            } else if (recStack.has(child)) {
                                return true;
                            }
                        }
                    }
                    recStack.delete(n);
                    return false;
                };
                
                // If there's no root (pure cycle), any node can start the check
                if (rootNode) {
                    return check(rootNode);
                } else {
                    for (const node of groupNodes) {
                        if (!visitedSearch.has(node)) {
                            if (check(node)) return true;
                        }
                    }
                }
                return false;
            };

            const cycleDetected = has_cycle(groupRoot);

            if (cycleDetected) {
                total_cycles++;
                // Lexicographically smallest node as root for pure cycles
                const finalRoot = groupRoot || groupNodes.sort()[0];
                hierarchies.push({
                    root: finalRoot,
                    tree: {},
                    has_cycle: true
                });
            } else {
                total_trees++;
                // Build nested tree and calculate depth
                const buildTree = (n) => {
                    const treeObj = {};
                    let d = 1;
                    if (adj[n]) {
                        adj[n].sort().forEach(child => {
                            const { nodeTree, depth } = buildTree(child);
                            treeObj[child] = nodeTree[child];
                            d = Math.max(d, 1 + depth);
                        });
                    }
                    return { nodeTree: { [n]: treeObj }, depth: d };
                };

                const { nodeTree, depth } = buildTree(groupRoot);
                hierarchies.push({
                    root: groupRoot,
                    tree: nodeTree,
                    depth: depth
                });

                if (depth > maxDepth) {
                    maxDepth = depth;
                    largest_tree_root = groupRoot;
                } else if (depth === maxDepth) {
                    if (groupRoot < largest_tree_root) {
                        largest_tree_root = groupRoot;
                    }
                }
            }
        });

        res.json({
            user_id: "nihalbasaniwal_29122005",
            email_id: "nb7687@srmist.edu.in",
            college_roll_number: "RA2311047010164",
            hierarchies,
            invalid_entries,
            duplicate_edges,
            summary: {
                total_trees,
                total_cycles,
                largest_tree_root
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ is_success: false, message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
