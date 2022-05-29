const fs = require('fs');
var past = "";
var line = 0
var tape = []

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
        },
        tse: (args) => {
            args = args.slice(1);
            final = args.slice(1);
            tape[parseInt(args[0])] = final.join(" ").replace("${x}", past);
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
        },
        tge: (args) => {
            return tape[parseInt(args[1])]
        }
    };
    var command = args[0].toLowerCase();
    if (!command.startsWith("--")){
        commands[command](args, past)
    } else {
        macro = command.substring(2)
        past = macros[macro](args, past)
    }
}

fs.readFile('main.mt','utf8', function(err, data){
    if (!err){
        let lines = data.split("\n");
        for (line = 0; line < lines.length; line++){
            try{
                parse(lines[line], past)
            }
            catch(e){
                if (e instanceof TypeError) {
                    console.log(`Undercooked: Failure to run command at line ${line + 1} -> ${lines[line]}`)
                } else {throw(e)}
            }
        }
    } else {throw(err)}
    // console.log(err||lines[1]);
})
