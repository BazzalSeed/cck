export interface TicketData {
  productCode: string;
  partName: string;
  material: string;
  processes: string[];
  ticketNumber: string;
  factoryNumber: string;
  notes: string;
  signer: string;
  signerDate: string;
  materialChecker: string;
  materialCheckerDate: string;
  quota: string;
  plannedQuantity: string;
}

export function renderTicketHtml(data: TicketData): string {
  const processRows = data.processes
    .map(
      (p, i) => `
    <tr>
      <td class="c">${i + 1}</td>
      <td class="c">${p}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  body { margin: 0; padding: 0; font-family: SimSun, serif; font-size: 14px; }
  table { border-collapse: collapse; width: 700px; }
  td, th { border: 1px solid #000; padding: 4px 8px; }
  .c { text-align: center; }
  .b { font-weight: bold; }
  .header { text-align: center; font-weight: bold; padding: 8px; }
</style>
</head>
<body>
<div id="ticket" style="width:700px;padding:16px;background:#fff;">
<table>
  <tr>
    <td colspan="5" class="header" style="font-size:18px;">
      四川成都空分配套阀门有限公司
    </td>
  </tr>
  <tr>
    <td colspan="5" class="header" style="font-size:20px;">
      车间工票
    </td>
  </tr>
  <tr>
    <td colspan="2">CCK/JL-SC-13</td>
    <td>编号: ${escapeHtml(data.ticketNumber)}</td>
    <td colspan="2">出厂编号: ${escapeHtml(data.factoryNumber)}</td>
  </tr>
  <tr>
    <td class="b">产品代号</td>
    <td>${escapeHtml(data.productCode)}</td>
    <td class="b">零件名称</td>
    <td>${escapeHtml(data.partName)}</td>
    <td class="b">代用</td>
  </tr>
  <tr>
    <td class="b">项目</td>
    <td class="b">计划量</td>
    <td class="b">实发</td>
    <td class="b">材质及编号</td>
    <td class="b">定额</td>
  </tr>
  <tr>
    <td></td>
    <td>${escapeHtml(data.plannedQuantity)}</td>
    <td></td>
    <td>${escapeHtml(data.material)}</td>
    <td>${escapeHtml(data.quota)}</td>
  </tr>
  <tr>
    <td>检验结果</td>
    <td></td>
    <td>交库者</td>
    <td colspan="2"></td>
  </tr>
  <tr>
    <td>零件库点收</td>
    <td></td>
    <td>领料人</td>
    <td>核料人: ${escapeHtml(data.materialChecker)}<br><small>${escapeHtml(data.materialCheckerDate)}</small></td>
    <td>签票者: ${escapeHtml(data.signer)}<br><small>${escapeHtml(data.signerDate)}</small></td>
  </tr>
  <tr style="background:#f0f0f0;">
    <th>工序</th>
    <th>操作简称</th>
    <th>工作者</th>
    <th>工序内容简述</th>
    <th>检验结果</th>
  </tr>
  ${processRows}
  <tr>
    <td colspan="5" style="padding:8px;">
      <strong>注意事项:</strong><br>${escapeHtml(data.notes).replace(/\n/g, "<br>")}
    </td>
  </tr>
</table>
</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
