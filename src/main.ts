import { TestM } from "module";

Log.info("Loaded ExampleTSMod main.ts.");

Events.on(ClientLoadEvent, (_) => {
  Time.runTask(10, () => {
    let dialog = new BaseDialog("Typescript");
    dialog.cont.add("test").row();
    dialog.cont
      .image(Core.atlas.find("tsmod-ts"))
      .pad(20)
      .row();
    dialog.cont.add(new testT());
    dialog.cont
      .button("@ok", () => {
        dialog.hide();
      })
      .size(100, 50);
    dialog.show();
  });
});
let t = new TestM();
t.test();
