const childProcess = require("child_process");
const process = require("process");
const readline = require("readline");
const rpc = require("vscode-jsonrpc");

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
        rl.on("line", line => {
            if (line == "exit" || line == "quit") rl.close();
            const pattern = /(\w+)\((.*)\)/;
            const match = pattern.exec(line);
            
            if (match) {
                // TODO
            } else {
                console.log("Please invoke a command! Example: name(argument1, argument2)");
            }

            rl.prompt();
        });

    } else {
        console.log(`Usage: node ${argv[1]} [path to language server executable]`)
    }
}

main();
