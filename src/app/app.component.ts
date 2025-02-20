/**
 * Sample app showcasing gojs-angular components
 * For use with gojs-angular version 2.x, assuming immutable data
 * This now uses GoJS version 3.0, using some of its new features,
 * but your app could use GoJS version 2.3.17, if you don't yet want to upgrade to v3.
 */

import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import * as go from 'gojs';
import { InspectorComponent } from './inspector/inspector.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [InspectorComponent],
  standalone: true
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('myDiagramDiv') diagramRef: ElementRef;
  
  private diagram: go.Diagram;
  private nodeIdCounter = 0;
  public selectedNodeData: go.ObjectData = null;

  // State management
  public state = {
    diagramNodeData: [
      { key: 'A', text: 'A', color: 'lightblue', loc: '0 0', width: 100, height: 60 },
      { key: 'B', text: 'B', color: 'orange', loc: '200 -100', width: 100, height: 60 }
    ],
    diagramLinkData: [
      { key: -1, from: 'A', to: 'B', fromPort: 'r', toPort: 'l' }
    ]
  };

  ngOnInit() {
    this.loadFromStorage();
  }

  ngAfterViewInit() {
    this.initDiagram();
  }

  private initDiagram() {
    const $ = go.GraphObject.make;
    this.diagram = new go.Diagram(this.diagramRef.nativeElement, {
      'undoManager.isEnabled': true,
      'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
      'commandHandler.archetypeGroupData': { key: 'Group', isGroup: true },
      model: new go.GraphLinksModel({
        linkToPortIdProperty: 'toPort',
        linkFromPortIdProperty: 'fromPort',
        linkKeyProperty: 'key'
      })
    });

    // Helper function to create ports
    const makePort = (id: string, spot: go.Spot) => {
      return $(go.Shape, 'Circle', {
        desiredSize: new go.Size(8, 8),
        fill: 'gray',
        opacity: 0.5,
        portId: id,
        alignment: spot,
        fromSpot: spot,
        toSpot: spot,
        fromLinkable: true,
        toLinkable: true,
        cursor: 'pointer'
      });
    };

    // Node template
    this.diagram.nodeTemplate = $(go.Node, 'Spot',
      {
        contextMenu: $(go.Adornment, 'Vertical',
          $('ContextMenuButton',
            $(go.TextBlock, 'Group'),
            { click: (e: go.InputEvent, obj: go.GraphObject) => e.diagram.commandHandler.groupSelection() }
          )
        ),
        selectionChanged: (node: go.Part) => {
          if (node.isSelected) {
            this.selectedNodeData = (node as go.Node).data;
          } else {
            this.selectedNodeData = null;
          }
        }
      },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Auto',
        $(go.Shape, 'Rectangle', {
          strokeWidth: 0.5
        },
        new go.Binding('fill', 'color'),
        new go.Binding('width'),
        new go.Binding('height')),
        $(go.TextBlock, {
          margin: 8,
          editable: true
        },
        new go.Binding('text').makeTwoWay())
      ),
      makePort('t', go.Spot.Top),
      makePort('l', go.Spot.Left),
      makePort('r', go.Spot.Right),
      makePort('b', go.Spot.Bottom)
    );

    // Link template
    this.diagram.linkTemplate = $(go.Link,
      {
        routing: go.Link.AvoidsNodes,
        fromEndSegmentLength: 30,
        toEndSegmentLength: 30
      },
      $(go.Shape, { strokeWidth: 1.5 }),
      $(go.Shape, { toArrow: 'Standard' })
    );

    // Load initial data
    this.diagram.model = new go.GraphLinksModel(this.state.diagramNodeData, this.state.diagramLinkData);

    // Add diagram listener for selection changes
    this.diagram.addDiagramListener('ChangedSelection', (e: go.DiagramEvent) => {
      const node = e.diagram.selection.first();
      if (node instanceof go.Node) {
        this.selectedNodeData = node.data;
      } else {
        this.selectedNodeData = null;
      }
    });
  }

  public addNode() {
    const nodeData = {
      key: `Node${++this.nodeIdCounter}`,
      text: 'New Node',
      color: 'lightblue',
      loc: '0 0',
      width: 100,
      height: 60
    };
    (this.diagram.model as go.GraphLinksModel).addNodeData(nodeData);
  }

  public saveToStorage() {
    const data = {
      nodeDataArray: this.diagram.model.nodeDataArray,
      linkDataArray: (this.diagram.model as go.GraphLinksModel).linkDataArray
    };
    localStorage.setItem('diagramState', JSON.stringify(data));
  }

  private loadFromStorage() {
    const savedState = localStorage.getItem('diagramState');
    if (savedState) {
      const data = JSON.parse(savedState);
      this.state.diagramNodeData = data.nodeDataArray;
      this.state.diagramLinkData = data.linkDataArray;
      
      // Update nodeIdCounter based on existing nodes
      const maxId = Math.max(...data.nodeDataArray
        .map((node: any) => parseInt(node.key.replace('Node', '')) || 0));
      this.nodeIdCounter = maxId;
    }
  }

  public handleInspectorChange(event: any) {
    const prop = event.prop;
    const newVal = event.newVal;
    
    if (this.selectedNodeData) {
      this.diagram.model.setDataProperty(this.selectedNodeData, prop, newVal);
    }
  }
}
