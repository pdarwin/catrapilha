import axios from "axios";

export async function getItemsArq(page, dataState, dataDispatch) {
  try {
    const res = await axios.get(
      `https://www.arquipelagos.pt/wp-json/wp/v2/imagem`,
      {
        params: {
          page: page,
          per_page: 100,
        },
      }
    );
    if (res.status !== 200) {
      throw new Error("Erro:" + res.status);
    }
    const items = res.data;
    if (dataState.totalPages !== res.headers.get("x-wp-totalpages")) {
      dataState.totalPages = res.headers.get("x-wp-totalpages");
    }
    let filteredItems = items
      .filter(
        item =>
          !dataState.data.Arquipelagos.some(
            arqItem => arqItem.id === item.id
          ) /* Código para excepções: ||
            item.content.rendered.indexOf("Garrido") !== -1 ||
            item.excerpt.rendered.indexOf("Garrido") !== -1 ||
            item.title.rendered.indexOf("Garrido") !== -1 */
      )
      .sort((a, b) => b.id - a.id); // Sort by id in descending order;
    if (dataState.filter) {
      filteredItems = filteredItems.filter(item => {
        return (
          item.title.rendered.includes(dataState.filter) ||
          item.content.rendered.includes(dataState.filter)
        );
      });
    }
    return filteredItems.slice(0, dataState.maxItems);
  } catch (error) {
    console.log(error);
  }
}

export async function processItems(
  items,
  cancelLoadItem,
  dispatch,
  state,
  actions
) {
  for (const item of items) {
    if (cancelLoadItem.signal.aborted) break;
    // Get the item.
    await getItem(item.id, cancelLoadItem, dispatch, state, actions);
  }
}

async function getItem(item, cancelLoadItem, dispatch, state, actions) {
  try {
    const res = await axios.get(
      `https://www.arquipelagos.pt/wp-json/wp/v2/imagem/${item}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status !== 200) {
      throw new Error("Erro:" + res.status);
    }
    const parsed = await res.data;

    getListItem(parsed, cancelLoadItem, dispatch, state, actions);
  } catch (error) {
    console.log("GetItem:", error);
    if (error.response.status === 400) {
      cancelLoadItem.abort();
    }
  }
}

function getListItem(item, cancelLoadItem, dispatch, state, actions) {
  if (cancelLoadItem.signal.aborted) return;
  axios
    .get(
      item._links["wp:featuredmedia"][0].href.replace(
        "https://www.arquipelagos.pt",
        "arqapi"
      )
    )
    .then(response => {
      if (response.status !== 200) {
        throw new Error("Erro:" + response.status);
      }
      return response.data;
    })
    .then(parsed => {
      const tmp = state.listItems;
      tmp.push({
        id: item.id,
        image: parsed.media_details.sizes.medium
          ? parsed.media_details.sizes.medium.source_url
          : parsed.media_details.sizes.full.source_url,
        title: item.title.rendered,
      });

      state.listItems = tmp;
      dispatch({
        type: actions.updateNListItems,
      });
    })
    .catch(error => {
      console.log("GetListItem:", error);
    });
}
