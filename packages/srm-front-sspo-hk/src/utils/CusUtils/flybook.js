export function closeWindow() {
  try {
    window.h5sdk.ready(() => {
      tt.closeWindow({
        fail(res) {
          console.log(`closeWindow fail: ${JSON.stringify(res)}`);
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
}
