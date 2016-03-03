<!DOCTYPE html>
<html lang="en">
<style type="text/css">body{margin:0;padding:20px;background:#CCC}</style>
<head>
    <title>Ranger Steve: Buffalo Invasion</title>
    <meta charset="utf-8">
    <link href="/css/app.css" rel="stylesheet">
</head>
<body onresize="">
    <canvas width="960" height="720" id="canvas"></canvas>
    <script>
    var ENV = <?= json_encode($data) ?>
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.6.1/lodash.min.js"></script>
    <script src="https://cdn.firebase.com/js/client/2.4.1/firebase.js"></script>
    <script src="/js/app.js"></script>
</body>
</html>
