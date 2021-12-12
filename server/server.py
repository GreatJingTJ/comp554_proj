import http.server
import os
import requests
import pandas as pd
import datetime
import json
import functools
import urllib
from http.server import HTTPServer, SimpleHTTPRequestHandler, test
#----------------------------------------------------------------------

def get_items_from_url(url, fn):
    """
    从url中获取html文本，解析后返回dict
    @param url 要解析的链接
    @return dict {'name' : '文件名', 'url' : '下载链接', "type": }
    """
  
    file_name = ".\dataset\\" + fn + ".csv"
    if os.path.exists(file_name):
        return

    headers = {
        'Host': 'raw.githubusercontent.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36 SE 2.X MetaSr 1.0',
    }

    response = requests.get(url=url, headers=headers)
    print(response)
    if response.status_code != 200:
        print('网页加载错误')
        return
    rawdata = response.text
    rawdata = rawdata.replace(",,", ",0,");
    rawdata = rawdata.split("\n")
    # print(rawdata)
    columns = rawdata[0].split(",");
    result = []
    for i in range(1, len(rawdata)):
        data = {}
        s = rawdata[i]
        if s.endswith(','):
            s += '0'
        # print(s)
        if len(s) == 0:
            continue
        d = s.split(",")
        result.append(d)
    columns = list(columns)
    # print(result)
    file_data = pd.DataFrame(result, index=range(len(result)), columns=columns)
    file_data.to_csv(file_name)


def compare(m, n):
    # 将数组元素转换为str,是为了处理大数问题
    m = m[0:-4]
    n = n[0:-4]
    m_month, m_day, m_year = m.split("-")
    n_month, n_day, n_year = n.split("-")
    if m_year < n_year:
        return -1
    if m_year > n_year:
        return 1
    if m_month < n_month:
        return -1
    if m_month > n_month:
        return 1
    if m_day < n_day:
        return -1
    if m_day > n_day:
        return 1
    return 0

#----------------------------------------------------------------------
month_day = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

dist = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DP": "Diamond Princess",
    "DC": "District of Columbia",
    "FL": "Florida",
    "GA": "Georgia",
    "GP": "Grand Princess",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
    }
states_map = {}
for k, v in dist.items():
    states_map[v] = k
today=datetime.date.today()
s = "" + str(today.month) + "-" + str(today.day).rjust(2,'0') + "-" + str(today.year)
# print(s)
# url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/" + s + ".csv"
# get_items_from_url(url, s)


filePath = ".\dataset\\"
file_list = os.listdir(filePath)

day = today.day;
month = 0;

previous_date = "" + str(today.month - month) + "-" + str(day).rjust(2,'0') + "-" + str(today.year)
while previous_date + ".csv" not in file_list:
    url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/" + previous_date + ".csv"
    get_items_from_url(url, previous_date)
    print(previous_date)
    day -= 1
    if day <= 0:
        month += 1
        day = month_day[today.month - month - 1]
    previous_date = "" + str(today.month - month) + "-" + str(day).rjust(2,'0') + "-" + str(today.year)

file_list = os.listdir(filePath)
result = pd.DataFrame(list(states_map.keys()))
result.columns = ["Province_State"]
file_list = sorted(file_list, key=functools.cmp_to_key(compare))

data_2021 = [[{} for i in range(31)] for j in range(12)]
data_2020 = [[{} for i in range(31)] for j in range(12)]

day_map = {}
for file_name in file_list:
    date = file_name[0:-4]
    month, day, year = date.split("-")
    if year == '2020':
        continue
    map_parsed = {}
    csv_data = pd.read_csv(filePath + file_name)  # 读取训练数据
    if "Total_Test_Results" in csv_data.columns:
        tests = "Total_Test_Results" 
    else:
        tests = "People_Tested"
    csv_data = csv_data[["Province_State", tests, "Confirmed"]]
    csv_data = csv_data.fillna(0)

    for index, row in csv_data.iterrows():
        map_parsed[tests] = row[tests]
        map_parsed["Confirmed"] = row["Confirmed"]
        state = row["Province_State"]
        if state in states_map.keys():
            day_map[states_map[state]] = map_parsed
        map_parsed = {}
    data_2021[int(month)-1][int(day)-1] = day_map
    day_map = {}

day_map = {}
for file_name in file_list:
    date = file_name[0:-4]
    month, day, year = date.split("-")
    if year == '2021':
        continue
    map_parsed = {}
    csv_data = pd.read_csv(filePath + file_name)  # 读取训练数据
    if "Total_Test_Results" in csv_data.columns:
        tests = "Total_Test_Results" 
    else:
        tests = "People_Tested"
    csv_data = csv_data[["Province_State", tests, "Confirmed"]]
    csv_data = csv_data.fillna(0)

    for index, row in csv_data.iterrows():
        map_parsed[tests] = row[tests]
        map_parsed["Confirmed"] = row["Confirmed"]
        state = row["Province_State"]
        if state in states_map.keys():
            day_map[states_map[state]] = map_parsed
        map_parsed = {}
    data_2020[int(month)-1][int(day)-1] = day_map
    day_map = {}

# for file_name in file_list:
#         print(file_name)
#         csv_data = pd.read_csv(filePath + file_name)  # 读取训练数据
#         states = csv_data["Province_State"]
#         if "Total_Test_Results" in csv_data.columns:
#             tests = csv_data["Total_Test_Results"] 
#         else:
#             tests = csv_data["People_Tested"] 
#         # patient = csv_data["Incident_Rate"] * 100000
#         patient = csv_data["Confirmed"]
#         result.insert(result.shape[1], file_name[0:-4], 0)
#         for i in range(len(states)):
#             if states[i] in states_map.keys():
#                 #行索引
#                 index = result[result["Province_State"]==states[i]].index.tolist()[0]
#                 result.iloc[index,len(result.columns)-1] = (patient[i])/(tests[i])
    
result.set_index("Province_State", inplace=True, drop=False) 

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

    def get_whole(self, state):
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        # period_result = result.loc[state]
        # today_result = period_result.to_json(orient="index")
        # parsed = json.loads(today_result)

        res = {'2020':data_2020,'2021':data_2021}  
        self.wfile.write(json.dumps(res, indent=4).encode())


    def get_today(self):
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        today = datetime.date.today()
        s = "" + str(today.month) + "-" + str(today.day-1).rjust(2,'0') + "-" + str(today.year)
        filePath = ".\dataset\\"
        file_list = os.listdir(filePath)
        if s + ".csv" in file_list:
            csv_data = pd.read_csv(filePath + s + ".csv")  # 读取训练数据
        else:
            day = today.day;
            month = 0;
            previous_date = "" + str(today.month - month) + "-" + str(day).rjust(2,'0') + "-" + str(today.year)
            while previous_date + ".csv" not in file_list:
                url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/" + previous_date + ".csv"
                get_items_from_url(url, previous_date)
                print(previous_date)
                day -= 1
                if day <= 0:
                    month += 1
                    day = month_day[today.month - month - 1]
                previous_date = "" + str(today.month - month) + "-" + str(day).rjust(2,'0') + "-" + str(today.year)

            url = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/" + s + ".csv"
            get_items_from_url(url, s)

        file_list = os.listdir(filePath)
        if s + ".csv" in file_list:
            csv_data = pd.read_csv(filePath + s + ".csv")  # 读取训练数据

            states = csv_data["Province_State"]
            if "Total_Test_Results" in csv_data.columns:
                tests = csv_data["Total_Test_Results"] 
            else:
                tests = csv_data["People_Tested"] 
            # patient = csv_data["Incident_Rate"] * 100000
            patient = csv_data["Confirmed"]
            csv_data.insert(csv_data.shape[1], "CPT", 0)
            for i in range(len(states)):
                if states[i] in states_map.keys():
                    #行索引
                    index = csv_data[csv_data["Province_State"]==states[i]].index.tolist()[0]
                    csv_data.iloc[index,len(csv_data.columns)-1] = (patient[i])/(tests[i])

            csv_data.set_index("Province_State", inplace=True, drop=False) 
            today_result = csv_data.to_json(orient="index")
            parsed = json.loads(today_result)
            self.wfile.write(json.dumps(parsed, indent=4).encode())
        else:
            data = {'error': "today's data not uploaded"}
            self.wfile.write(json.dumps(data).encode())

    # 处理一个GET请求		
    def do_GET(self):
        # data = {'result': 'this is a test'}
        # self.send_response(200)
        # self.send_header('Content-type','application/json')
        # self.end_headers()  #发送\r\n,意味这下一行为报体
        # self.wfile.write(json.dumps(data).encode())

        if self.path == '/today':
            self.get_today()
        else :
            if '?' in self.path:
                self.queryString=urllib.parse.unquote(self.path.split('?',1)[1]) 
                params=urllib.parse.parse_qs(self.queryString) 
                print(params)
                state = params['state']
                self.get_whole(state)
            

    def do_POST(self):
        if '?' in self.path:
            self.queryString=urllib.parse.unquote(self.path.split('?',1)[1]) 
            params=urllib.parse.parse_qs(self.queryString) 
            print(params)
            state = params['state']
            self.get_whole(state)

		
if __name__ == '__main__':
    print(data_2021)
    print("*****************")
    print(data_2020)
    # print(result)
    host = ('192.168.1.72', 8888)
    # # serverAddress = ('', 8080)
    # # http://localhost:8888/
    print("sever start")
    server = http.server.HTTPServer(host, CORSRequestHandler)
    server.serve_forever()
    
