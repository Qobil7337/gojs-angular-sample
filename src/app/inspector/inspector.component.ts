import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as go from 'gojs';
import { CommonModule } from '@angular/common';
import { InspectorRowComponent } from './inspector-row.component';

@Component({
  selector: 'app-inspector',
  imports: [CommonModule, InspectorRowComponent],
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css'],
})
export class InspectorComponent {
  @Input()
  public nodeData: go.ObjectData;

  @Output()
  public onInspectorChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  public onInputChange(propAndValObj: any) {
    this.onInspectorChange.emit(propAndValObj);
  }
}
