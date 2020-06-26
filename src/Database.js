/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Button } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';

const dbName = 'test.db';
const createFromLocation = '~sqlite.db'
const tableName = 'user';
const columnFeatures = 'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    'name VARCHAR(20),' +
    'age INT(10),' +
    'address VARCHAR(255)';

var obj = {
    name: "Aynur",
    age: 14,
    address: "some value"
};

var selectColumn = 'name, age, id';

// where
// var whereColumn = 'id=?'
// var whereValue = [3]

// like
// var whereColumn = 'name like ? and id=?';
// var whereValue = ['%Ay%', 2] 

var whereColumn = 'name like ?';
var whereValue = ['%Ay%'] 
var otherFilter = 'order by name desc'

const db = openDatabase({ name: dbName, createFromLocation: createFromLocation });

const Database = () => {
    const [results, setResults] = useState(null);
    const [text, setText] = useState(null);

    useEffect(() => {
        selectTable(tableName);
        console.log(results)
    }, [results])

    const createTable = (tableName) => {
        db.executeSql(
            'CREATE TABLE IF NOT EXISTS ' + tableName + ' (' +
            columnFeatures + ')',
            []
        );
    };

    const dropTable = (tableName) => {
        db.executeSql('DROP TABLE IF EXISTS ' + tableName, []);
    }

    const selectTable = (tableName, selectColumn, otherFilter) => {
        db.transaction(t => {
            t.executeSql('SELECT ' + selectColumn + ' FROM ' + tableName + ' ' + otherFilter,
            [],
                (t, results) => {
                    convertToObject(results.rows);
                });
        });
    };


    const selectTableWithCondition = (tableName, selectColumn, whereColumn, whereValue, otherFilter) => {
        db.transaction(t => {
            t.executeSql('SELECT ' + selectColumn + ' FROM ' + tableName + ' where ' + whereColumn + ' ' + otherFilter,
                whereValue,
                (t, results) => {
                    convertToObject(results.rows);
                });
        });
    };

    const deleteTable = (tableName, whereColumn, whereValue) => {
        db.transaction(t => {
            t.executeSql(
                'DELETE FROM ' + tableName + ' where ' + whereColumn,
                whereValue,
            );
        });
    };

    const insertTable = (tableName, obj) => {
        const temp = Object.values(obj);
        let value = "'";
        for (let i = 0; i < temp.length - 1; i++) {
            value += temp[i] + "', '";
        }

        value += temp[temp.length - 1] + "'";

        db.transaction(t => {
            t.executeSql(
                'INSERT INTO ' + tableName + ' (' + Object.keys(obj) + ') VALUES (' + value + ')',
            );
        });
    };

    const updateTable = (tableName, obj, whereColumn, whereValue) => {
        const tempKey = Object.keys(obj);
        const tempValue = Object.values(obj);
        let sets = "";
        for (let i = 0; i < tempValue.length - 1; i++) {
            sets += tempKey[i] + "='" + tempValue[i] + "', ";
        }

        sets += tempKey[tempKey.length - 1] + "='" + tempValue[tempValue.length - 1] + "'";

        console.log(sets)
        db.transaction(t => {
            t.executeSql(
                'UPDATE ' + tableName + ' set ' + sets + ' where ' + whereColumn,
                whereValue
            );
        });
    };

    const convertToObject = (value) => {
        let array = [];
        for (let i = 0; i < value.length; i++) {
            array.push(value.item(i));
        }
        setResults(array);
    };

    const list = (
        <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={results}
            renderItem={({ item }) => <Text>{item.name}</Text>}
        />
    );

    return (
        <>
            <TextInput
                style={styles.textInput}
                onChangeText={text => selectTableWithCondition(tableName, selectColumn, whereColumn, ['%' + text + '%'], otherFilter)}
                value={text}
            />
            <View style={styles.list}>
                {list}
            </View>
            <Button title="Create Database" onPress={() => createTable(tableName)} />
            <Button title="Drop Database" onPress={() => dropTable(tableName)} />
            <Button title="Select All" onPress={() => selectTable(tableName, selectColumn, otherFilter)} />
            <Button title="Select" onPress={() => selectTableWithCondition(tableName, selectColumn, whereColumn, whereValue, otherFilter)} />
            <Button title="Insert" onPress={() => insertTable(tableName, obj)} />
            <Button title="Update" onPress={() => updateTable(tableName, obj, whereColumn, whereValue)} />
            <Button title="Delete" onPress={() => deleteTable(tableName, whereColumn, whereValue)} />
        </>
    );
};

const styles = StyleSheet.create({
    textInput: {
        height: 40,
        borderColor: 'gray',
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        margin: 10,
    },
    list: {
        margin: 10,
    },
});

export default Database;


    // const selectTableWithWhere = (tableName, column, where) => {
    //     setText(where)
    //     db.transaction(t => {
    //         t.executeSql('SELECT * FROM ' + tableName + ' where ' + column + '=?',
    //             [where],
    //             (t, results) => {
    //                 convertToObject(results.rows);
    //             });
    //     });
    // };

    // const selectTableWithLike = (tableName, column, where) => {
    //     setText(where)
    //     db.transaction(t => {
    //         t.executeSql('SELECT * FROM ' + tableName + ' where ' + column + ' like ?',
    //             ['%' + where + '%'],
    //             (t, results) => {
    //                 convertToObject(results.rows);
    //             });
    //     });
    // };