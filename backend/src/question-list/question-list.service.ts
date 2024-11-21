import { Injectable } from "@nestjs/common";
import { QuestionListRepository } from "./question-list.repository";
import { CreateQuestionListDto } from "./dto/create-question-list.dto";
import { QuestionDto } from "./dto/question.dto";
import { QuestionListDto } from "./dto/question-list.dto";
import { GetAllQuestionListDto } from "./dto/get-all-question-list.dto";
import { QuestionListContentsDto } from "./dto/question-list-contents.dto";
import { MyQuestionListDto } from "./dto/my-question-list.dto";
import { DataSource, QueryRunner } from "typeorm";
import { QuestionList } from "./question-list.entity";
import { Question } from "./question.entity";

@Injectable()
export class QuestionListService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly questionListRepository: QuestionListRepository
    ) {}

    async getAllQuestionLists() {
        const allQuestionLists: GetAllQuestionListDto[] = [];

        const publicQuestionLists =
            await this.questionListRepository.findPublicQuestionLists();

        for (const publicQuestionList of publicQuestionLists) {
            const { id, title, usage } = publicQuestionList;
            const categoryNames: string[] =
                await this.questionListRepository.findCategoryNamesByQuestionListId(
                    id
                );

            const questionCount =
                await this.questionListRepository.getQuestionCountByQuestionListId(
                    id
                );

            const questionList: GetAllQuestionListDto = {
                id,
                title,
                categoryNames,
                usage,
                questionCount,
            };
            allQuestionLists.push(questionList);
        }
        return allQuestionLists;
    }

    async getAllQuestionListsByCategoryName(categoryName: string) {
        const allQuestionLists: GetAllQuestionListDto[] = [];

        const categoryId =
            await this.questionListRepository.getCategoryIdByName(categoryName);

        if (!categoryId) {
            return [];
        }

        const publicQuestionLists =
            await this.questionListRepository.findPublicQuestionListsByCategoryId(
                categoryId
            );

        for (const publicQuestionList of publicQuestionLists) {
            const { id, title, usage } = publicQuestionList;
            const categoryNames: string[] =
                await this.questionListRepository.findCategoryNamesByQuestionListId(
                    id
                );

            const questionCount =
                await this.questionListRepository.getQuestionCountByQuestionListId(
                    id
                );

            const questionList: GetAllQuestionListDto = {
                id,
                title,
                categoryNames,
                usage,
                questionCount,
            };
            allQuestionLists.push(questionList);
        }
        return allQuestionLists;
    }

    // 질문 생성 메서드
    async createQuestionList(createQuestionListDto: CreateQuestionListDto) {
        const { title, contents, categoryNames, isPublic, userId } =
            createQuestionListDto;

        const categories = await this.findCategoriesByNames(categoryNames);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();

        try {
            const questionListDto = new QuestionList();
            questionListDto.title = title;
            questionListDto.categories = categories;
            questionListDto.isPublic = isPublic;
            questionListDto.userId = userId;

            const createdQuestionList =
                await queryRunner.manager.save(questionListDto);

            const questions = contents.map((content, index) => {
                const question = new Question();
                question.content = content;
                question.index = index;
                question.questionList = createdQuestionList;

                return question;
            });

            const createdQuestions =
                await queryRunner.manager.save(questions);

            await queryRunner.commitTransaction();

            return { createdQuestionList, createdQuestions };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(error.message);
        } finally {
            await queryRunner.release();
        }
    }

    async getQuestionListContents(questionListId: number) {
        const questionList =
            await this.questionListRepository.getQuestionListById(
                questionListId
            );
        const { id, title, usage, userId } = questionList;

        const contents =
            await this.questionListRepository.getContentsByQuestionListId(
                questionListId
            );

        const categoryNames =
            await this.questionListRepository.findCategoryNamesByQuestionListId(
                questionListId
            );

        const username =
            await this.questionListRepository.getUsernameById(userId);

        const questionListContents: QuestionListContentsDto = {
            id,
            title,
            contents,
            categoryNames,
            usage,
            username,
        };

        return questionListContents;
    }

    async getMyQuestionLists(userId: number) {
        const questionLists =
            await this.questionListRepository.getQuestionListsByUserId(userId);

        const myQuestionLists: MyQuestionListDto[] = [];
        for (const myQuestionList of questionLists) {
            const { id, title, isPublic, usage } = myQuestionList;
            const categoryNames: string[] =
                await this.questionListRepository.findCategoryNamesByQuestionListId(
                    id
                );

            const contents =
                await this.questionListRepository.getContentsByQuestionListId(
                    id
                );

            const questionList: MyQuestionListDto = {
                id,
                title,
                contents,
                categoryNames,
                isPublic,
                usage,
            };
            myQuestionLists.push(questionList);
        }
        return myQuestionLists;
    }

    async findCategoriesByNames(categoryNames: string[]) {
        const categories =
            await this.questionListRepository.findCategoriesByNames(
                categoryNames
            );

        if (categories.length !== categoryNames.length) {
            throw new Error("Some category names were not found.");
        }

        return categories;
    }
}
