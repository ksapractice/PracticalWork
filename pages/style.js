let styles = `
* {
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui;;
}
body {
  background: linear-gradient(90deg, rgba(148,55,235,1) 0%, rgba(55,127,235,1) 50%, rgba(148,55,235,1) 100%);
  display: flex;
}
.container {
  margin-top: 10px;
  width: 900px;
  display: block;
  height: auto;
  margin-left: auto;
  margin-right: auto;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  padding: 0 15px;
}
h1 {
  text-align: center;
  padding-top: 20px;
  padding-bottom: 20px;
  color: white;
}
.content-table {
  border-collapse: collapse;
  margin: auto;
  width: auto!important;
  border-radius: 5px 5px 0 0;
  overflow: hidden;
  margin-bottom: 15px;
}
.content-table thead tr {
  background-color: rgb(46, 109, 95);
  color: white;
  text-align: left;
  font-weight: bold;
}
.content-table th,
.content-table td {
  padding: 12px 15px;
}
.content-table tbody tr {
  background-color: rgb(255, 253, 253);
  border-bottom: 1px solid #ddd;
}
.content-table tbody tr:last-of-type {
  border-bottom: 8px solid rgb(46, 109, 95);
}
`;

module.exports = styles;
