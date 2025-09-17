let ctx = { quoteId: null, products: [] };

ZOHO.embeddedApp.on("PageLoad", async function(loadData){
  // 1) get current Quote ID from context
  ctx.quoteId = loadData && loadData.EntityId ? loadData.EntityId : null;
  document.getElementById("quoteId").textContent = ctx.quoteId || "(not found)";

  // 2) load Products (your 3 test products)
  const res = await ZOHO.CRM.API.getAllRecords({ Entity: "Products", per_page: 200, page: 1 });
  ctx.products = (res && res.data) ? res.data : [];
  const sel = document.getElementById("productSelect");
  sel.innerHTML = ctx.products.map(p => `<option value="${p.id}">${p.Product_Name || p.Name || p.id}</option>`).join("");
});

ZOHO.embeddedApp.init();

document.getElementById("saveBtn").onclick = async () => {
  const status = document.getElementById("status");
  if(!ctx.quoteId){ status.textContent = "No Quote context found."; return; }

  const sel = document.getElementById("productSelect");
  const productId = sel.value;
  const product = ctx.products.find(p => String(p.id) === String(productId));
  const productName = product ? (product.Product_Name || product.Name || product.id) : "";

  try {
    status.textContent = "Updating Quote field...";
    // 3) write chosen product name into Quotes.Selected_Activity_Test
    await ZOHO.CRM.API.updateRecord({
      Entity: "Quotes",
      APIData: { id: ctx.quoteId, Selected_Activity_Test: productName }
    });

    status.textContent = "Saved. Closing modal...";
    await ZOHO.CRM.UI.Popup.close();
  } catch (e) {
    status.textContent = "Failed. Check field API name/scopes.";
    console.error(e);
  }
};
