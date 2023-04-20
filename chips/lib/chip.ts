/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../elevation/elevation.js';
import '../../focus/focus-ring.js';
import '../../ripple/ripple.js';

import {html, LitElement, nothing, TemplateResult} from 'lit';
import {property, queryAsync, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {pointerPress, shouldShowStrongFocus} from '../../focus/strong-focus.js';
import {ripple} from '../../ripple/directive.js';
import {MdRipple} from '../../ripple/ripple.js';

/**
 * A chip component.
 */
export class Chip extends LitElement {
  @property({type: Boolean}) disabled = false;
  @property({type: Boolean}) elevated = false;
  @property() href = '';
  @property() label = '';
  @property() target = '';

  @state() private showFocusRing = false;
  @state() private showRipple = false;
  @queryAsync('md-ripple') private readonly ripple!: Promise<MdRipple|null>;

  override render() {
    return this.href ? this.renderAnchor() : this.renderButton();
  }

  protected renderButton() {
    return html`
      <button class="container ${classMap(this.getContainerClasses())}"
          ?disabled=${this.disabled}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
          @pointerdown=${this.handlePointerDown}
          ${ripple(this.getRipple)}>
        ${this.renderRootChildren()}
      </button>
    `;
  }

  protected renderAnchor() {
    return html`
      <a class="container ${classMap(this.getContainerClasses())}"
          ?disabled=${this.disabled}
          href=${(this.href || nothing) as unknown as string}
          target=${(this.href ? this.target : nothing) as unknown as '_blank'}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
          @pointerdown=${this.handlePointerDown}
          ${ripple(this.getRipple)}>
        ${this.renderRootChildren()}
      </a>
    `;
  }

  protected renderRootChildren() {
    return html`
      ${!this.elevated ? html`<span class="outline"></span>` : nothing}
      ${this.elevated ? html`<md-elevation></md-elevation>` : nothing}
      ${this.showRipple ? this.renderRipple() : nothing}
      <md-focus-ring .visible=${this.showFocusRing}></md-focus-ring>
      <span class="icon leading">
        ${this.renderLeadingIcon()}
      </span>
      <span class="label">${this.label}</span>
      <span class="icon trailing">
        ${this.renderTrailingIcon()}
      </span>`;
  }

  protected getContainerClasses() {
    return {
      disabled: this.disabled,
      elevated: this.elevated,
    };
  }

  protected renderLeadingIcon(): TemplateResult {
    return html`<slot name="leading-icon"></slot>`;
  }

  protected renderTrailingIcon(): TemplateResult|typeof nothing {
    return nothing;
  }

  private renderRipple() {
    return html`<md-ripple ?disabled=${this.disabled}></md-ripple>`;
  }

  private readonly getRipple = () => {  // bind to this
    this.showRipple = true;
    return this.ripple;
  };

  private handleBlur() {
    this.showFocusRing = false;
  }

  private handleFocus() {
    this.showFocusRing = shouldShowStrongFocus();
  }

  private handlePointerDown() {
    pointerPress();
    this.showFocusRing = shouldShowStrongFocus();
  }
}
