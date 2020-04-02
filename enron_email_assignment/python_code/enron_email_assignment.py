import os
import sqlite3
import email
import codecs


class DocumentSearch():

    def initialize_database(self):
        db = sqlite3.connect("enron.sql")
        cursor = db.cursor()
        return cursor, db

    def close_database(self, cursor, db):
        cursor.close()
        db.commit()
        db.close()
        return True

    def get_directories(self, DATA_DIR):
        directories_path = []
        for directory in os.listdir(DATA_DIR):
            directory_folder = os.path.join(DATA_DIR, directory)
            CURRENT_DATA_DIR = os.path.join(directory_folder)
            if os.path.isdir(directory_folder):
                directories_path.append(directory_folder)
            for selected_folder in os.listdir(CURRENT_DATA_DIR):
                selected_directory_folder = os.path.join(CURRENT_DATA_DIR, selected_folder)
                if os.path.isdir(selected_directory_folder):
                    directories_path.append(selected_directory_folder)

        return directories_path

    def parseEmail(self, emailPath):
        message = codecs.open(emailPath, encoding='utf-8', errors='ignore')
        file_object = email.message_from_file(message)
        headers = file_object.items()
        email_info = dict(headers)
        email_info['Body'] = str(file_object.get_payload())
        message.close()
        return email_info

    def search_files(self, files_path):
        keyword = []
        cursor, db = self.initialize_database()

        # dropTable = "drop table enrondata1"
        # cursor.execute(dropTable)

        createTable = "CREATE VIRTUAL TABLE IF NOT EXISTS enrondata1 USING fts3(content TEXT)"
        # createTable = "CREATE VIRTUAL TABLE email_data USING fts3(content TEXT, )"
        cursor.execute(createTable)

        for file in files_path:
            with open(file, 'rb') as data_file:
                data = self.parseEmail(file)
                email_from = data["From"]
                if 'To' in data:
                    email_to = data["To"]
                else:
                    email_to = ''
                subject = data["Subject"]
                body = data["Body"]
                body = body.replace('\n', ' ')
                date = data["Date"]
                # document = data_file.read()
                cursor.execute("insert into enrondata1(content) values (?)", [body])
        self.close_database(cursor, db)
        return keyword

    def get_files(self, PATH_TO_FOLDER):
        files_path = []
        for DATA_FOLDER in PATH_TO_FOLDER:
            for filename in os.listdir(DATA_FOLDER):
                file = os.path.join(DATA_FOLDER, filename)
                if os.path.isdir(file):
                    pass
                else:
                    files_path.append(file)
        keywords = self.search_files(files_path)
        return keywords


if __name__ == "__main__":
    document = DocumentSearch()
    ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(ROOT_DIR, 'skilling-j')
    # init_db = document.initialize_database()
    total_directories = document.get_directories(DATA_DIR)
    files = document.get_files(total_directories)


