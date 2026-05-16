import * as readline from "node:readline";
import { mkdir, writeFile } from 'node:fs/promises';
import { stdin as input, stdout as output } from "node:process";
import validator from 'validator';
const rl = readline.createInterface({ input, output });
var TipoCuenta;
(function (TipoCuenta) {
    TipoCuenta["CC"] = "CC";
    TipoCuenta["CA"] = "CA";
})(TipoCuenta || (TipoCuenta = {}));
var Validacion;
(function (Validacion) {
    Validacion[Validacion["String"] = 0] = "String";
    Validacion[Validacion["Number"] = 1] = "Number";
    Validacion[Validacion["Date"] = 2] = "Date";
    Validacion[Validacion["Email"] = 3] = "Email";
    Validacion[Validacion["TipoCuenta"] = 4] = "TipoCuenta";
})(Validacion || (Validacion = {}));
function parseDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year ?? 0, (month ?? 0) - 1, day);
}
async function ask(question, type) {
    return new Promise(async (resolve) => {
        rl.question(question, async (answer) => {
            let isValid = true;
            switch (type) {
                case Validacion.String:
                    isValid = !!answer.trim();
                    break;
                case Validacion.Number:
                    isValid = !isNaN(Number(answer)) && Number(answer) > 0;
                    break;
                case Validacion.Date:
                    isValid = isValidDate(parseDate(answer)) && parseDate(answer) > new Date();
                    break;
                case Validacion.Email:
                    isValid = answer.trim() == "" || validator.isEmail(answer);
                    break;
                case Validacion.TipoCuenta:
                    answer = answer.toUpperCase();
                    isValid = Object.values(TipoCuenta).includes(answer);
                    break;
            }
            if (isValid) {
                resolve(answer);
            }
            else {
                resolve(await ask(question, type));
            }
        });
    });
}
async function createFile(fechaPago, data) {
    try {
        await mkdir('./archivos', { recursive: true });
        let tipoRegistro = "E";
        const codigoInstitucion = "401005107";
        const bancoReceptor = "APAP";
        const fechaTransmision = new Date().toLocaleDateString('es-DO');
        const fechaPagoString = fechaPago.toLocaleDateString('es-DO');
        let header = `${tipoRegistro},${codigoInstitucion},${bancoReceptor},${fechaTransmision},${fechaPagoString}`;
        let texto = `${header}\n\n`;
        for (const empleado of data) {
            texto += `${Object.values(empleado).map(v => (!!v) ? v : "N/A").join(",")}\n`;
        }
        tipoRegistro = "S";
        const cantidadRegistros = data.length;
        const totalNomina = data.reduce((sum, current) => sum + current.monto, 0);
        let footer = `${tipoRegistro},${cantidadRegistros},${totalNomina}`;
        texto += `\n${footer}`;
        await writeFile(`archivos/pago.txt`, texto);
    }
    catch (error) {
        console.error('Error creando el archivo:', error);
    }
}
function isValidDate(date) {
    return !isNaN(date.getTime());
}
async function main() {
    let activo = true;
    let data = [];
    while (activo) {
        console.log("\n------------------------------------------\n");
        console.log("1. Ingresar un nuevo empleado");
        console.log("2. Salir");
        let opcion = await ask("\nElija una opcion: ", Validacion.String);
        switch (opcion.trim()) {
            case "1":
                const cedula = await ask("Cedula: ", Validacion.String);
                const numeroCuentaEmisor = await ask("Numero cuenta del emisor: ", Validacion.String);
                const numeroCuentaEmpleado = await ask("Numero cuenta del empleado: ", Validacion.String);
                const tipoCuenta = await ask("Tipo de cuenta(CC, CA): ", Validacion.TipoCuenta);
                const monto = Number(await ask("Monto: ", Validacion.Number));
                const correoEmpleado = await ask("Correo del empleado (Opcional): ", Validacion.Email);
                data.push({
                    cedula,
                    numeroCuentaEmisor,
                    numeroCuentaEmpleado,
                    tipoCuenta,
                    monto,
                    correoEmpleado
                });
                break;
            case "2":
                const fechaPago = parseDate(await ask("Fecha de pago (dd/mm/yyyy): ", Validacion.Date));
                await createFile(fechaPago, data);
                activo = false;
                break;
            default:
                console.log("Opcion no valida");
                break;
        }
    }
    rl.close();
}
main().catch(console.error);
//# sourceMappingURL=index.js.map