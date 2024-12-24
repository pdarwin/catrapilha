import axios from "axios";

export async function getItemsProject1(page, dispatch, state, actions) {
  try {
    const res = await axios.get("https://arquivo-abm.madeira.gov.pt/details", {
      params: {
        id: page,
      },
    });
    if (res.status !== 200) {
      throw new Error("Erro:" + res.status);
    }
    const dataHtml = res.data;

    const item = {};

    let pattern = new RegExp("<title>(.*?)</title>", "s");
    let match = pattern.exec(dataHtml);
    item.title = match
      ? clean(match[1]).replace(
          " - Arquivo e Biblioteca da Madeira - Archeevo",
          ""
        )
      : "NOT FOUND";

    pattern = new RegExp(
      '<span id="DetailsControl_RepeaterFields_ctl02_DynamicFieldControlValue_SimpleDynamicField1_ReferenceCodeFieldControl1_LabelText" class="Value highlightable">(.*?)</span>',
      "s"
    );
    match = pattern.exec(dataHtml);
    item.refCode = match ? match[1] : "NOT FOUND";

    pattern = new RegExp(
      '<li class="AspNet-TreeView-Root AspNet-TreeView-ChildSelected">.*?\\((.*?)\\)',
      "s"
    );
    match = pattern.exec(dataHtml);
    item.root = match ? match[1] : "NOT FOUND";

    pattern = new RegExp('<meta name="image" content="(.*?)" />', "s");
    match = pattern.exec(dataHtml);
    item.refCode === "NOT FOUND"
      ? console.log("Root   : ", item.root)
      : console.log("RefCode: ", item.refCode);
    console.log("Título : ", item.title);

    if (!match) {
      console.log("Sem imagem!");
      return;
    } else {
      item.image = match[1].replace("&amp;", "&");
    }

    pattern = new RegExp('<meta name="description" content="(.*?)" />', "s");
    match = pattern.exec(dataHtml);
    item.description = match ? clean(match[1]) : "NOT FOUND";

    pattern = new RegExp(
      '<span id="DetailsControl_RepeaterFields_ctl01_DynamicFieldControlValue_SimpleDynamicField1_DescriptionLevelFieldControl1_LabelText" class="LabelDescriptionLevel">(.*?)</span>',
      "s"
    );
    match = pattern.exec(dataHtml);
    item.level = match ? match[1] : "NOT FOUND";

    pattern = new RegExp(
      '<span id="DetailsControl_RepeaterFields_ctl13_DynamicFieldControlValue_SimpleDynamicField1_DatetimeFieldControl1_LabelText" class="Value highlightable">(.*?)</span>',
      "s"
    );
    match = pattern.exec(dataHtml);
    item.pubDate = match ? match[1] : "NOT FOUND";

    pattern = new RegExp(
      '<span id="DetailsControl_RepeaterFields_ctl00_DynamicFieldControlValue_SimpleDynamicField1_NumberFieldControl1_LabelText" class="Value highlightable">(.*?)</span>',
      "s"
    );
    match = pattern.exec(dataHtml);
    item.id = match ? match[1] : "NOT FOUND";

    pattern = new RegExp(
      '<span id="DetailsControl_RepeaterFields_ctl05_DynamicFieldControlValue_SimpleDynamicField1_TextFieldControl1_spanText" class="Value highlightable"><span class="break-line">(.*?)</span>',
      "s"
    );
    match = pattern.exec(dataHtml);
    item.dimension = match ? match[1] : "NOT FOUND";

    console.log(item);
    const tmp = state.listItems;
    tmp.push(item);
    state.listItems = tmp;
    dispatch({
      type: actions.updateNListItems,
    });
  } catch (error) {
    console.log(error);
  }
}

const clean = raw => {
  return raw.replace(/\r/g, "").replace(/\n/g, "").replace(/\t/g, "");
};
