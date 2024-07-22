const { destroy } = require("../controller/chat.controller");
const db = require("../utils/db");
const { Sequelize, DataTypes, Op } = require("sequelize");
var sequelize = db.sequelize;
//-----------------------------
const Menu = sequelize.define("Geminis", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    keygemini: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, //trang thái: 1 đang cập nhật 0 hủy bỏ 2 đã hoàn thành
    },
});
function register(keygemini) {
    return new Promise(async (resolve, reject) => {
        try {
            let isoks = await Menu.findOne({
                where: { keygemini: keygemini }
            });
            if (!isoks || isoks.length < 1) {
                var newMenu = await Menu.create({
                    keygemini
                });
                return resolve(newMenu);
            } else {
                return reject(error);
            }
        } catch (error) {
            return reject(error);
        }
    });
}

async function list() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const datas = await Menu.findAll({
            attributes: ["keygemini", "date", "count"]
        });

        const filteredDatas = datas.filter(data => {
            const dataDate = data.date ? new Date(data.date).toISOString().split('T')[0] : null;
            if (dataDate === today) {
                return data.count < 1000;
            } else {
                return true;
            }
        });

        return filteredDatas.map(data => ({ keygemini: data.keygemini,count: data.count,date: data.date, }));
    } catch (error) {
        return [];
    }
}

async function findOne(keygemini) {
    try {
        const datas = await Menu.findOne({
            where: { keygemini: keygemini },
        });
        return datas;
    } catch (error) {
        return [];
    }
}
async function destroys(keygemini) {
    try {
        const menu = await Menu.findOne({
            where: { keygemini }
        });

        if (menu) {
            await menu.destroy();
            return { message: 'Menu deleted successfully' };
        } else {
            return { message: 'Menu not found' };
        }
    } catch (error) {
        return { message: 'Error occurred', error };
    }
}
async function updateCount(keygemini) {
    try {
        const menu = await Menu.findOne({
            where: { keygemini }
        });
        if (menu) {
            const today = new Date().toISOString().split('T')[0];
            const menuDate = menu.date ? new Date(menu.date).toISOString().split('T')[0] : null;
            if (today === menuDate) {
                menu.count += 1;
            } else {
                menu.date = new Date();
                menu.count = 1;
            }

            await menu.save();
            return menu;
        } else {
            return { message: 'Menu not found' };
        }
    } catch (error) {
        return { message: 'Error occurred', error };
    }
}
module.exports = {
    register,
    list,
    findOne,
    destroys,
    updateCount
};
