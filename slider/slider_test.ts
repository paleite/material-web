/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {html} from 'lit';

import {Environment} from '../testing/environment.js';
import {createTokenTests} from '../testing/tokens.js';

import {SliderHarness} from './harness.js';
import {MdSlider} from './slider.js';

interface SliderTestProps {
  range?: boolean;
  value?: number;
  valueStart?: number;
  valueEnd?: number;
}

function getSliderTemplate(props?: SliderTestProps) {
  return html`
    <md-slider
      .range=${props?.range ?? false}
      .value=${props?.value ?? 0}
      .valueStart=${props?.valueStart ?? 0}
      .valueEnd=${props?.valueEnd ?? 0}
    ></md-slider>`;
}

describe('<md-slider>', () => {
  const env = new Environment();

  async function setupTest(
      props?: SliderTestProps, template = getSliderTemplate) {
    const root = env.render(template(props));
    await env.waitForStability();
    const slider = root.querySelector<MdSlider>('md-slider')!;
    const harness = new SliderHarness(slider);
    return {harness, root};
  }

  describe('.styles', () => {
    createTokenTests(MdSlider.styles);
  });

  describe('rendering value', () => {
    it('updates via interaction', async () => {
      const {harness} = await setupTest();
      await harness.simulateValueInteraction(1);
      expect(harness.element.value).toEqual(1);
      await harness.simulateValueInteraction(9);
      expect(harness.element.value).toEqual(9);
    });

    it('not validated when set', async () => {
      const {harness} = await setupTest();
      harness.element.value = -1000;
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(-1000);
    });

    it('validated on interaction', async () => {
      const {harness} = await setupTest();
      harness.element.value = -1000;
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(-1000);
      await harness.simulateValueInteraction(1);
      expect(harness.element.value).toEqual(1);
    });

    it('setting min validates only after interaction', async () => {
      const {harness} = await setupTest({value: 1});
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(1);
      harness.element.min = 2;
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(1);
      await harness.simulateValueInteraction(0);
      expect(harness.element.value).toEqual(2);
    });

    it('setting max validates only after interaction', async () => {
      const {harness} = await setupTest({value: 9});
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(9);
      harness.element.max = 8;
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(9);
      await harness.simulateValueInteraction(111);
      expect(harness.element.value).toEqual(8);
    });

    it('setting step validates only after interaction', async () => {
      const {harness} = await setupTest({value: 5});
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(5);
      harness.element.step = 2;
      await harness.element.updateComplete;
      expect(harness.element.value).toEqual(5);
      await harness.simulateValueInteraction(3);
      expect(harness.element.value).toEqual(4);
    });
  });

  describe('rendering valueStart/valueEnd (range = true)', () => {
    it('renders inputs and handles', async () => {
      const props = {range: true, valueStart: 2, valueEnd: 6};
      const {harness} = await setupTest(props);
      await harness.element.updateComplete;
      const inputs = harness.getInputs();
      expect(inputs[0]).not.toBeNull();
      expect(inputs[1]).not.toBeNull();
      const handles = harness.getHandles();
      expect(handles[0]).not.toBeNull();
      expect(handles[1]).not.toBeNull();
    });

    it('update via interaction', async () => {
      const props = {range: true, valueStart: 2, valueEnd: 6};
      const {harness} = await setupTest(props);
      expect(harness.element.value).toEqual(0);
      const [endInput, startInput] = harness.getInputs();
      await harness.simulateValueInteraction(7, endInput);
      expect(harness.element.valueStart).toEqual(2);
      expect(harness.element.valueEnd).toEqual(7);
      await harness.simulateValueInteraction(1, startInput);
      expect(harness.element.valueStart).toEqual(1);
      expect(harness.element.valueEnd).toEqual(7);
    });

    it('not validated when set', async () => {
      const props = {range: true, valueStart: 2, valueEnd: 6};
      const {harness} = await setupTest(props);
      const testValueStart = -1000;
      const testValueEnd = -900;
      harness.element.valueStart = testValueStart;
      harness.element.valueEnd = testValueEnd;
      await harness.element.updateComplete;
      expect(harness.element.valueStart).toEqual(testValueStart);
      expect(harness.element.valueEnd).toEqual(testValueEnd);
    });

    it('validated on interaction', async () => {
      const props = {range: true, valueStart: 2, valueEnd: 6};
      const {harness} = await setupTest(props);
      const testValueStart = -1000;
      const testValueEnd = -900;
      harness.element.valueStart = testValueStart;
      harness.element.valueEnd = testValueEnd;
      await harness.element.updateComplete;
      await harness.simulateValueInteraction(1000);
      expect(harness.element.valueStart).toEqual(harness.element.min);
      expect(harness.element.valueEnd).toEqual(harness.element.max);
    });

    it('setting min validates only after interaction', async () => {
      const props = {range: true, valueStart: 2, valueEnd: 6};
      const {harness} = await setupTest(props);
      harness.element.min = 3;
      await harness.element.updateComplete;
      expect(harness.element.valueStart).toEqual(2);
      expect(harness.element.valueEnd).toEqual(6);
      const startInput = harness.getInputs()[1];
      await harness.simulateValueInteraction(0, startInput);
      expect(harness.element.valueStart).toEqual(3);
      expect(harness.element.valueEnd).toEqual(6);
    });

    it('setting max validates only after interaction', async () => {
      const props = {range: true, valueStart: 2, valueEnd: 6};
      const {harness} = await setupTest(props);
      harness.element.max = 5;
      await harness.element.updateComplete;
      expect(harness.element.valueStart).toEqual(2);
      expect(harness.element.valueEnd).toEqual(6);
      await harness.simulateValueInteraction(111);
      expect(harness.element.valueStart).toEqual(2);
      expect(harness.element.valueEnd).toEqual(5);
    });

    it('setting step validates only after interaction', async () => {
      const props = {range: true, valueStart: 2, valueEnd: 6};
      const {harness} = await setupTest(props);
      harness.element.step = 2;
      await harness.element.updateComplete;
      const [endInput, startInput] = harness.getInputs();
      await harness.simulateValueInteraction(7, endInput);
      await harness.simulateValueInteraction(5, startInput);
      expect(harness.element.valueStart).toEqual(6);
      expect(harness.element.valueEnd).toEqual(8);
    });
  });

  describe('value label', () => {
    it('shows on focus when withLabel is true', async () => {
      const {harness} = await setupTest();
      harness.element.withLabel = true;
      await harness.element.updateComplete;
      harness.element.focus();
      expect(harness.isLabelShowing()).toBeTrue();
    });

    it('does now show when withLabel is false', async () => {
      const {harness} = await setupTest();
      await harness.element.updateComplete;
      harness.element.focus();
      expect(harness.isLabelShowing()).toBeFalse();
    });

    it('hides after blur', async () => {
      const {harness} = await setupTest();
      harness.element.withLabel = true;
      await harness.element.updateComplete;
      harness.element.focus();
      expect(harness.isLabelShowing()).toBeTrue();
      harness.element.blur();
      expect(harness.isLabelShowing()).toBeFalse();
    });

    it('shows value label on hover', async () => {
      const {harness} = await setupTest();
      harness.element.withLabel = true;
      await harness.element.updateComplete;
      await harness.startHover();
      expect(harness.isLabelShowing()).toBeTrue();
      await harness.endHover();
      expect(harness.isLabelShowing()).toBeFalse();
    });
  });

  describe('focus', () => {
    it('focuses on the end input by default', async () => {
      const {harness} = await setupTest({value: 5});
      await harness.element.updateComplete;
      harness.element.focus();
      const input = harness.getInputs()[0];
      expect(input.matches(':focus')).toBe(true);
    });
  });
});
