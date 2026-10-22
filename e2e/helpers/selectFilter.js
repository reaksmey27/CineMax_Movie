export async function selectFilter(trigger, value) {
  await trigger.click();
  await trigger
    .page()
    .locator('[role="option"][data-value="' + value + '"]')
    .click();
}
