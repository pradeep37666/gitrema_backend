import { Injectable } from '@nestjs/common';
//import * as Printer from 'node-thermal-printer';
import { execute } from 'html2thermal';
import * as Printer from 'escpos';
import * as USB from 'escpos-usb';

@Injectable()
export class PrinterService {
  async print(template: string) {
    // const printer = new Printer.ThermalPrinter({
    //   type: Printer.PrinterTypes.EPSON,
    //   interface: 'tcp://109.171.133.40:17446',
    // });
    // console.log(printer);
    // printer.print('Test');
    // await execute(printer, template);

    const device = USB();

    // const device  = new escpos.Network('localhost');
    // const device  = new escpos.Serial('/dev/usb/lp0');

    const options = { encoding: 'GB18030' /* default */ };
    // encoding is optional

    const printer = new Printer(device, options);

    device.open(function (error) {
      printer
        .font('a')
        .align('ct')
        .style('bu')
        .size(1, 1)
        .text('The quick brown fox jumps over the lazy dog')
        .text('敏捷的棕色狐狸跳过懒狗')
        .barcode('1234567', 'EAN8')
        .table(['One', 'Two', 'Three'])
        .tableCustom([
          { text: 'Left', align: 'LEFT', width: 0.33 },
          { text: 'Center', align: 'CENTER', width: 0.33 },
          { text: 'Right', align: 'RIGHT', width: 0.33 },
        ])
        .qrimage('https://github.com/song940/node-escpos', function (err) {
          this.cut();
          this.close();
        });
    });
  }
}
