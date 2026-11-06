const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Theme Customizer presets and options integrity', () => {
  const customStyles = require('../../src/lib/store-custom-styles.ts');
  const styleOptions = require('../../src/lib/store-style-options.json');
  const layoutOptions = require('../../src/lib/store-layout-options.json');
  const heroVisibility = require('../../src/lib/store-hero-visibility.json');

  // Verify style:font option is registered and has valid options
  const fontField = styleOptions.find((f) => f.key === 'style:font');
  assert.ok(fontField, 'style:font must be registered in store-style-options.json');
  assert.equal(fontField.default, 'sans');
  assert.ok(fontField.options.some((o) => o.value === 'sans'));
  assert.ok(fontField.options.some((o) => o.value === 'serif'));
  assert.ok(fontField.options.some((o) => o.value === 'rounded'));

  // Verify custom style keys cover buttons, navbar, and cards
  assert.ok(customStyles.customStyleKeys.has('custom:buttons:background'));
  assert.ok(customStyles.customStyleKeys.has('custom:buttons:color'));
  assert.ok(customStyles.customStyleKeys.has('custom:buttons:radius'));
  assert.ok(customStyles.customStyleKeys.has('custom:navbar:background'));
  assert.ok(customStyles.customStyleKeys.has('custom:navbar:color'));
  assert.ok(customStyles.customStyleKeys.has('custom:card:background'));
  assert.ok(customStyles.customStyleKeys.has('custom:card:radius'));
  assert.ok(customStyles.customStyleKeys.has('custom:card:borderColor'));

  // Test color validation
  assert.equal(customStyles.validCustomStyle('custom:buttons:background', '#017d6e'), true);
  assert.equal(customStyles.validCustomStyle('custom:buttons:background', '#1d4ed8'), true);
  assert.equal(customStyles.validCustomStyle('custom:buttons:background', 'invalid'), false);

  // Test radius validation
  assert.equal(customStyles.validCustomStyle('custom:buttons:radius', '25'), true);
  assert.equal(customStyles.validCustomStyle('custom:buttons:radius', '0'), true);
  assert.equal(customStyles.validCustomStyle('custom:buttons:radius', '999'), false);

  // Verify hero visibility keys match store-hero-visibility.json
  assert.ok(heroVisibility.some((f) => f.key === 'visibility:hero:title'));
  assert.ok(heroVisibility.some((f) => f.key === 'visibility:hero:content'));
  assert.ok(heroVisibility.some((f) => f.key === 'visibility:hero:button'));
  assert.ok(heroVisibility.some((f) => f.key === 'visibility:hero:note'));
});
