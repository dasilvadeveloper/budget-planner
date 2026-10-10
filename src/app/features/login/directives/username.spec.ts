import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Username } from './username';

@Component({
  imports: [ReactiveFormsModule, Username],
  template: `<input appUsername [formControl]="control" />`,
})
class TestHost {
  control = new FormControl('', { nonNullable: true });
}

describe('Username', () => {
  let fixture: ComponentFixture<TestHost>;
  let input: HTMLInputElement;

  const type = (value: string, caret = value.length) => {
    input.value = value;
    input.setSelectionRange(caret, caret);
    input.dispatchEvent(new Event('input'));
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('keeps letters, digits and underscores', () => {
    type('Hendrik_92');

    expect(input.value).toBe('Hendrik_92');
    expect(fixture.componentInstance.control.value).toBe('Hendrik_92');
  });

  it('removes spaces and symbols from both the field and the form control', () => {
    type(' hen drik!@#-.92 ');

    expect(input.value).toBe('hendrik92');
    expect(fixture.componentInstance.control.value).toBe('hendrik92');
  });

  it('replaces accented letters with their plain equivalent', () => {
    type('joão_çé');

    expect(fixture.componentInstance.control.value).toBe('joao_ce');
  });

  it('keeps the caret in place when a character is removed mid-text', () => {
    type('hen!drik', 4);

    expect(input.value).toBe('hendrik');
    expect(input.selectionStart).toBe(3);
  });
});
