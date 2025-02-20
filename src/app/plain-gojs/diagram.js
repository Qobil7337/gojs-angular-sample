let myDiagram;
let nodeIdCounter = 0;

// Initialize the diagram
function init() {
    const $ = go.GraphObject.make;
    myDiagram = new go.Diagram("myDiagramDiv", {
        "undoManager.isEnabled": true,
        "clickCreatingTool.archetypeNodeData": { text: "new node", color: "lightblue" },
        "commandHandler.archetypeGroupData": { key: "Group", isGroup: true },
        model: new go.GraphLinksModel({
            linkToPortIdProperty: "toPort",
            linkFromPortIdProperty: "fromPort",
            linkKeyProperty: "key"
        })
    });

    // Helper function to create ports
    function makePort(id, spot) {
        return $(go.Shape, "Circle", {
            desiredSize: new go.Size(8, 8),
            fill: "gray",
            opacity: 0.5,
            portId: id,
            alignment: spot,
            fromSpot: spot,
            toSpot: spot,
            fromLinkable: true,
            toLinkable: true,
            cursor: "pointer"
        });
    }

    // Node template
    myDiagram.nodeTemplate = $(go.Node, "Spot", {
        contextMenu: $(go.Adornment, "Vertical",
            $("ContextMenuButton",
                $(go.TextBlock, "Group"),
                { click: (e, obj) => e.diagram.commandHandler.groupSelection() }
            )
        ),
        selectionChanged: onNodeSelected
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Panel, "Auto",
        $(go.Shape, "Rectangle", {
            strokeWidth: 0.5
        },
        new go.Binding("fill", "color"),
        new go.Binding("width"),
        new go.Binding("height")),
        $(go.TextBlock, {
            margin: 8,
            editable: true
        },
        new go.Binding("text").makeTwoWay())
    ),
    makePort("t", go.Spot.Top),
    makePort("l", go.Spot.Left),
    makePort("r", go.Spot.Right),
    makePort("b", go.Spot.Bottom)
    );

    // Link template
    myDiagram.linkTemplate = $(go.Link, {
        routing: go.Link.AvoidsNodes,
        fromEndSegmentLength: 30,
        toEndSegmentLength: 30
    },
    $(go.Shape, { strokeWidth: 1.5 }),
    $(go.Shape, { toArrow: "Standard" })
    );

    // Load initial data
    loadFromStorage();

    // Set up inspector
    myDiagram.addDiagramListener("ObjectSingleClicked", onNodeSelected);
}

// Add a new node
function addNode() {
    const nodeData = {
        key: `Node${++nodeIdCounter}`,
        text: "New Node",
        color: "lightblue",
        loc: "0 0",
        width: 100,
        height: 60
    };
    myDiagram.model.addNodeData(nodeData);
}

// Save diagram state to localStorage
function save() {
    const data = {
        nodeDataArray: myDiagram.model.nodeDataArray,
        linkDataArray: myDiagram.model.linkDataArray
    };
    localStorage.setItem("diagramState", JSON.stringify(data));
}

// Load diagram state from localStorage
function loadFromStorage() {
    const savedState = localStorage.getItem("diagramState");
    if (savedState) {
        const data = JSON.parse(savedState);
        myDiagram.model = new go.GraphLinksModel(data.nodeDataArray, data.linkDataArray);
        // Update nodeIdCounter based on existing nodes
        const maxId = Math.max(...data.nodeDataArray
            .map(node => parseInt(node.key.replace("Node", "")) || 0));
        nodeIdCounter = maxId;
    } else {
        // Initial diagram data
        const nodeDataArray = [
            { key: "A", text: "A", color: "lightblue", loc: "0 0", width: 100, height: 60 },
            { key: "B", text: "B", color: "orange", loc: "200 -100", width: 100, height: 60 }
        ];
        const linkDataArray = [
            { key: -1, from: "A", to: "B", fromPort: "r", toPort: "l" }
        ];
        myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    }
}

// Inspector functionality
function onNodeSelected(e) {
    const node = e.diagram?.selection?.first();
    if (node instanceof go.Node) {
        const data = node.data;
        const inspector = document.getElementById("inspectorProps");
        inspector.innerHTML = `
            <div>
                <label>Text: </label>
                <input type="text" value="${data.text}" 
                    onchange="updateNodeProperty('text', this.value)">
            </div>
            <div>
                <label>Color: </label>
                <input type="color" value="${data.color}"
                    onchange="updateNodeProperty('color', this.value)">
            </div>
        `;
    }
}

function updateNodeProperty(prop, value) {
    const node = myDiagram.selection.first();
    if (node) {
        myDiagram.model.setDataProperty(node.data, prop, value);
    }
}

// Initialize when the page loads
window.addEventListener('DOMContentLoaded', init);
