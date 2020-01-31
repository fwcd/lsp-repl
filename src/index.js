const childProcess = require("child_process");
const process = require("process");
const readline = require("readline");
const rpc = require("vscode-jsonrpc");

const flatMap = (f, arr) => arr.reduce((xs, x) => [...xs, ...f(x)], []);

function main() {
    const argv = process.argv;
    if (argv.length == 3) {
        const serverPath = argv[2];
        const serverProcess = childProcess.spawn(serverPath);
        const connection = rpc.createMessageConnection(
            new rpc.StreamMessageReader(serverProcess.stdout),
            new rpc.StreamMessageWriter(serverProcess.stdin)
        );
        connection.listen();
        
        const rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt("LSP> ");
        rl.prompt();
        rl.on("line", async line => {
            if (line == "exit" || line == "quit") {
                rl.close();
                return;
            }
            const pattern = /(\w+)\((.*)\)/;
            const match = pattern.exec(line);
            
            if (match) {
                const method = match[1];
                let params = flatMap(
                    s => s ? [JSON.parse(s)] : [],
                    match[2].split(/,\s*/)
                );
                console.log(`Sending request ${method} with params ${JSON.stringify(params)}...`);
                
                try {
                    const response = await connection.sendRequest(method, ...params)
                    console.log(JSON.stringify(response, null, 2));
                } catch (e) {
                    console.log(e);
                }
            } else {
                console.log("Please invoke a command! Example: name(argument1, argument2)");
            }

            rl.prompt();
        });
        rl.on("close", () => {
            serverProcess.kill("SIGINT");
            process.exit(0);
        });
    } else {
        console.log(`Usage: node ${argv[1]} [path to language server executable]`)
    }
}

main();
