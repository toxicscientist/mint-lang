// Hello future me, error throwing. Goodbye
const { readFile } = require('node:fs');
var past = "";
var line = 0

function parse(code){
    var args = code.split(" ");
    var commands = {
        prn: (args, past) => {
            args = args.slice(1);
            args = args.join(" ").replace("${x}", past);
            console.log(args);
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
            line = parseInt(args[0]) - 2;
        }
    };
    var macros = {
        add: (args) => {
            return parseInt(args[1].replace('x', (past || 1))) + parseInt(args[2].replace("x", past || 1));;
        },
        sub: (args) => {
            return parseInt(args[1].replace('x', (past || 1))) - parseInt(args[2].replace("x", past || 1));;
        },
        div: (args) => {
            return parseInt(args[1].replace('x', (past || 1))) / parseInt(args[2].replace("x", past || 1));;
        },
        mul: (args) => {
            return parseInt(args[1].replace('x', (past || 1))) * parseInt(args[2].replace("x", past || 1));;
        },
        cmp: (args) => {
            return (args[1] == args[2] ? 1 : 0)
        }
    };
    var command = args[0];
    if (!command.startsWith("--")){
        commands[command](args, past)
    } else {
        macro = command.substring(2)
        past = macros[macro](args, past)
    }
}

readFile('main.mt','utf8', function(err, data){
    if (!err){
        let lines = data.split("\n");
        for (line = 0; line < lines.length; line++){
            parse(lines[line], past);
        }
    } else {throw err}
    // console.log(err||lines[1]);
})