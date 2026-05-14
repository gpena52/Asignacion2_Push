import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
const rl = readline.createInterface({ input, output });
function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
        // rl.close();
    });
}
async function main() {
    const cedula = await ask("Cedula: ");
    const numeroCuentaEmisor = await ask("Numero cuenta del emisor: ");
    const numeroCuentaEmpleado = await ask("Numero cuenta del empleado: ");
    const tipoCuenta = await ask("Tipo de cuenta: ");
    const monto = Number(await ask("Monto: "));
    const correoEmpleado = await ask("Correo del empleado: ");
    console.log({ cedula, numeroCuentaEmisor, numeroCuentaEmpleado, tipoCuenta, monto, correoEmpleado });
}
main().catch(console.error);
//# sourceMappingURL=index.js.map