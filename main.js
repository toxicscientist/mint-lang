const fs = require('fs');
const os = require("os");
var past = "";
var line = 0
var tape = []



function log(message="Well Done", color="none", effect="none"){
    let colors = {
        undercooked: "\x1b[1;33m",
        overcooked: "\x1b[31m",
        none: "\x1b[0m"
    };
    let effects = {
        highlight: "\x1b[7m",
        underline: "\x1b[4m",
        none: "\x1b[2m",
    };
    console.log(
        colors[color] +
        effects[effect] +
        message +
        "\033[0m"
    );
}

function forceClose(){
    log("Process gracefully shut down", "overcooked", "highlight")
    process.kill(process.pid, "SIGTERM");
}

function parse(code) {
    var args = code.split(" ");
    var commands = {
        prn: (args, past) => {
            args = args.slice(1);
            if (args.join(" ").includes("${x}") && !past) {
                log(
                    "Undercooked: ${x} is undefined at line " + (line + 1),
                    "undercooked",
                    "underline"
                );
            } else {
                args = args.join(" ").replace("${x}", past);
                console.log(args);
            }
        },
        ify: (args, past) => {
            args = args.slice(1);
            if (past == args[0]) {
                parse(args.slice(1).join(" "));
            }
        },
        ifn: (args, past) => {
            args = args.slice(1);
            if (past != args[0]) {
                parse(args.slice(1).join(" "));
            }
        },
        got: (args) => {
            args = args.slice(1);
            let origin = line;
            line = parseInt(args[0]) - 2;
            if (line < 0) {
                log(
                    "Undercooked: Goto leads to out of bounds location! Tries to go to line " +
                        (line + 2),
                    "undercooked",
                    "underline"
                );
                line = origin;
            } else if ((line = origin - 1)) {
                log(
                    "Overcooked: Goto leads to self(INFINITE LOOP)! Tries to go to line " +
                        (line + 2),
                    "overcooked",
                    "underline"
                );
                forceClose();
            }
        },
        tse: (args) => {
            args = args.slice(1);
            final = args.slice(1);
            tape[parseInt(args[0])] = final.join(" ").replace("${x}", past);
        }
    };
    var macros = {
        add: (args) => {
            return (
                parseInt(args[1].replace("x", past || 1)) +
                parseInt(args[2].replace("x", past || 1))
            );
        },
        sub: (args) => {
            return (
                parseInt(args[1].replace("x", past || 1)) -
                parseInt(args[2].replace("x", past || 1))
            );
        },
        div: (args) => {
            return (
                parseInt(args[1].replace("x", past || 1)) /
                parseInt(args[2].replace("x", past || 1))
            );
        },
        mul: (args) => {
            return (
                parseInt(args[1].replace("x", past || 1)) *
                parseInt(args[2].replace("x", past || 1))
            );
        },
        cmp: (args) => {
            return args[1] == args[2] ? 1 : 0;
        },
        tge: (args) => {
            return tape[parseInt(args[1])];
        },
    };
    var command = args[0].toLowerCase();
    if (!command.startsWith("--")) {
        commands[command](args, past);
    } else {
        macro = command.substring(2);
        past = macros[macro](args, past);
    }
}

fs.readFile('main.mt','utf8', function(err, data){
    if (!err){
        let lines = data.split(os.EOL);
        for (line = 0; line < lines.length; line++){
            try{
                parse(lines[line], past)
            }
            catch(e){
                if (e instanceof TypeError) {
                    log("Undercooked: Unrecognized command at line " + (line + 1) + " -> " + lines[line], "undercooked", "underline")
                } else {throw(e)}
            }
        }
    } else {throw(err)}
})
