const express = require('express');
const app = express();
app.use(express.json());

const fs = require('fs');

// USERS DATA JSON
const users = './data/users.json';
const usersData = require(users);
const stringUsersData = JSON.stringify(usersData)
let regex = /\{\}\,/i;


// GET ALL USERS 
app.get('/api/user', (req, res) => {
    res.send(usersData)
})

// ADD NEW USER
app.post('/api/user', (req, res) => {
    // GET DATA FROM FRONT SUBMIT FORM 
    const user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }


    let dataUser = JSON.stringify(user);
    let okData = `,
     ${dataUser}
      ]`;
    console.log(okData.toString());
    let buffer = new Buffer.from(okData)
    // ADD NEW DATA TO EXISTING JSON FILE WITH FS MODULE 
    fs.open('./data/users.json', 'a', function (err, fd) {

        fs.fstat(fd, (err, stats) => {
            if (err) {
                console.error(`Error getting file stats: ${err.message}`);
                return;
            } else {
                const fileSize = stats.size;

                // Calculate offset of the last byte (end minus one)
                const lastByteOffset = fileSize - 1;

                console.log(`Offset of the last byte in the file: ${lastByteOffset}`);

                fs.write(fd, buffer, 0, buffer.length,
                    lastByteOffset, function (err, writtenbytes) {
                        if (err) {
                            console.log('Cant write to file');
                        } else {
                            console.log(writtenbytes +
                                ' characters added to file');
                        }
                    })
            }

        })
        // If the output file does not exists 
        // an error is thrown else data in the 
        // buffer is written to the output file 
    })

    const parseUsersData = JSON.parse(stringUsersData)
    res.send(okData)
})



// GET ONE USER AND DELETE IT 

app.delete('/api/user/:username', function (req, res) {
    let username = req.params.username;
    let usersDataObject = usersFileToObject(stringUsersData);

    for (let i = 0; i < usersDataObject.length; i++) {
        if (username == usersDataObject[i].username) {
            delete usersDataObject[i].username;
            delete usersDataObject[i].email;
            delete usersDataObject[i].password
            let userDataStringify = JSON.stringify(usersDataObject);
            let userDataStringifyCleaned = userDataStringify.replace(regex, '')
            let buffer = new Buffer.from(userDataStringifyCleaned)
            console.log(userDataStringifyCleaned);
            console.log(buffer);

            fs.writeFile('./data/users.json', buffer, { encoding: 'utf8', flag: 'w' }, function (err) {
                if (err) {
                    console.log('Cant write to file');
                } else {
                    console.log('New file edited©');
                }
            })
        }

    }
    res.send('done')
});


function usersFileToObject(stringUsersData) {
    let jsonStr = stringUsersData.replace(/(\w+:)|(\w+ :)/g, function (s) {
        return '"' + s.substring(0, s.length - 1) + '":';
    });
    let obj = JSON.parse(jsonStr);
    return obj;
}

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port : ${port}`));