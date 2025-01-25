import { $i18n } from "gen/bundle";
import { $content } from "gen/content";
import { TestM } from "module";

Log.info("Loaded ExampleTSMod main.ts.");

Events.on(ClientLoadEvent, (_) => {
  Time.runTask(10, () => {
    let dialog = new BaseDialog("Typescript");
    dialog.cont.add($i18n("ts_template.test")).row();
    dialog.cont.add($i18n("ts_template.test_lazy")).row();
    dialog.cont
      .image(Core.atlas.find("tsmod-ts"))
      .pad(20)
      .row();
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
new Packages.mindustry._I_type.Item("test");

