import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { User } from "@/user/user.entity";
import "dotenv/config";
import { addTransactionalDataSource } from "typeorm-transactional";
import { QuestionList } from "@/question-list/entity/question-list.entity";
import { Question } from "@/question-list/entity/question.entity";
import { Category } from "@/question-list/entity/category.entity";

export const typeOrmConfig: DataSourceOptions = {
    type: "mysql",
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    username: process.env.MYSQL_USERNAME || "root",
    password: process.env.MYSQL_PASSWORD || "mysql",
    database: process.env.MYSQL_DATABASE || "preview",
    entities: [User, QuestionList, Question, Category],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
};

let transactionalDataSource: DataSource | null = null;

export const createDataSource = async (): Promise<DataSource> => {
    if (!transactionalDataSource) {
        transactionalDataSource = addTransactionalDataSource(new DataSource(typeOrmConfig));

        await transactionalDataSource.initialize();
        await seedDatabase(transactionalDataSource);
    }
    return transactionalDataSource;
};

const seedDatabase = async (dataSource: DataSource) => {
    const categoryRepository = dataSource.getRepository(Category);

    const categories = [
        "자료구조",
        "운영체제",
        "데이터베이스",
        "컴퓨터구조",
        "네트워크",
        "백엔드",
        "프론트엔드",
        "알고리즘",
        "보안",
        "기타",
    ];

    // 이미 존재하는 카테고리 이름들을 가져옴
    const existingCategories = await categoryRepository.find();
    const existingCategoryNames = new Set(existingCategories.map((cat) => cat.name));

    // 새로 추가할 카테고리만 필터링
    const newCategories = categories.filter((name) => !existingCategoryNames.has(name));

    // 새 로추가할 카테고리가 없으면 return
    if (newCategories.length === 0) return;

    const categoryEntity = newCategories.map((name) => {
        const category = new Category();
        category.name = name;
        return category;
    });

    await categoryRepository.save(categoryEntity);
};
