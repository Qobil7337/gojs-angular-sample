import { Input } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inspector-row',
  templateUrl: './inspector-row.component.html',
  imports: [FormsModule],
})
export class InspectorRowComponent {
  @Input()
  public id: string;

  @Input()
  public value: string;

  @Output()
  public onInputChangeEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  public onInputChange(e: any) {
    // when <input> is changed, emit an Object up, with what property changed, and to what new value
    let newVal = e.target.value;
    
    // Convert to number for width and height
    if (this.id === 'width' || this.id === 'height') {
      newVal = parseFloat(newVal);
      if (isNaN(newVal)) return; // Don't emit if not a valid number
    }
    
    this.onInputChangeEmitter.emit({ prop: this.id, newVal: newVal });
  }
}
