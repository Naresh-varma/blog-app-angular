const blogMod = angular.module('blog-app', ['ngRoute']);
blogMod.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl : 'partials/blogs.html',
            controller : 'blogsCtrl'
        })
        .when('/login', {
            templateUrl : 'partials/login.html',
            controller : 'loginCtrl'
        })
        .when('/users', {
            templateUrl : 'partials/users.html',
            controller  : 'userCtrl'
        })
        .when('/user/:userId', {
            templateUrl : 'partials/userdetails.html',
            controller  : 'userdetailsCtrl'
        })
        .when('/blogs', {
            templateUrl : 'partials/blogs.html',
            controller  : 'blogsCtrl'
        })
        .when('/blog/:blogId', {
            templateUrl : 'partials/blogdetails.html',
            controller  : 'blogdetailsCtrl'
        })
        .when('/register', {
            templateUrl : 'partials/register.html',
            controller  : 'registerCtrl'
        })
        .when('/addBlog', {
            templateUrl : 'partials/addblog.html',
            controller  : 'addBlogCtrl'
        })
        .when('/editBlog/:blogId', {
            templateUrl : 'partials/editblog.html',
            controller  : 'editBlogCtrl'
        })
        .otherwise({ redirect : '/blogs'})
}]);
blogMod.controller('editBlogCtrl', ['$scope', '$rootScope', '$http', '$routeParams', function($scope, $rootScope, $http, $routeParams){
    const url = 'http://localhost:3000/users/blog/' + $routeParams.blogId;       
    $scope.blog = {};                    
    $http.get(url)
        .then(function(res){
            $scope.blog = res.data.blog;
            $scope.title = res.data.blog.title;
            $scope.description = res.data.blog.description;
        }, function(err){
            console.log(err);
        })
    $scope.editBlog = function(){
        if($scope.title == '' || $scope.description == ''){
            alert('Please dont leave blank');
        }else{
            $scope.blog = {
                blog_id : $routeParams.blogId,
                title : $scope.title,
                description : $scope.description,
                token : $rootScope.token
            }
            $http.post('http://localhost:3000/users/editBlog', $scope.blog)
                .then(function(res){
                    window.location = '#!/blog/' + res.data.blog._id;
                }, function(res){
                    let status = (res.data.isLogedIn) ? (res.data.isAdmin ? 'success' : 'Only Admin is allowed to edit the blog') : 'Token invalid please login again';
                    alert(status);
                    console.log(res);
                })
        }       
    }
}]);
blogMod.controller('addBlogCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http){
    $scope.addBlog = function(){
        if($rootScope.token == null){
            alert("Please LogIn to addBlog" );
            window.location = '#!/login';
        }else{
            if($scope.title == undefined || $scope.description == undefined || $scope.title == '' || $scope.description == ''){
                alert('Please dont leave blank');
            }else{
                $scope.blog = {
                    title : $scope.title,
                    description : $scope.description,
                    token : $rootScope.token
                }
                $http.post('http://localhost:3000/users/createBlog', $scope.blog)
                .then(function(res){
                   // alert("Successfully created");
                    window.location = '#!/blog/' + res.data.blog._id;
                }, function(res){
                    let status = (res.data.isLogedIn) ? (res.data.isAdmin ? 'success' : 'Only Admin is allowed to edit the blog') : 'Error';
                    alert(status);
                    console.log(res);
                })           
            }
        }
    }
}]);
blogMod.controller('loginCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope){
    // {
    //     "password" : "naresh@123",
    //     "email" : "naresh123@gmail.com"
    // }
    if($rootScope.token != null){
        window.location = '#!/blogs';
    }    
    $scope.logIn = function(){
        if($scope.user.email == null || $scope.user.password == null){
            alert('Please provide Email And Password');
        }else{
            $http.post('http://localhost:3000/users/logIn', $scope.user)
                .then(function(res){
                    $rootScope.token = res.data.token;
                    $rootScope.name = res.data.name;
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('name', res.data.name);
                    window.location = '#!/blogs';
                }, function(err){
                    alert('Invalid  Email/Password ');
                    console.log(err);
                })
        }       
    }
}]);
blogMod.controller('registerCtrl', ['$scope', '$rootScope', '$http', function($scope,$rootScope, $http){
    // "password" : "deepak@123",
	// "email" : "deepak@gmail.com",
	// "name" : "Deepak",
    // "phoneNumber" : "9912146562"
    //console.log('In registerCtrl');
    if( $rootScope.token != null){
        alert('please log out to register');
        window.location = '#!/blogs';
    }
    $scope.register = function(){
        if($scope.user.password == null || $scope.user.email == null || $scope.user.name == null || $scope.user.phoneNumber == null){
            alert('Please provide all fields..PhoneNumber should have 10 digits');
        }else{
            $http.post("http://localhost:3000/users/signUp", $scope.user)
                .then(function(res){
                    alert('Please LogIn to your new account');
                    window.location = '#!/login';
                }, function(res){
                    if(res.data.err.code == 11000){
                        alert('User(email) already exists');
                    }else{
                        console.log('Failed ' + JSON.stringify(res));
                    }           
                })
        }      
    }
}]);
blogMod.controller('blogdetailsCtrl', ['$routeParams', '$scope', '$rootScope', '$http', function($routeParams, $scope, $rootScope, $http){
    const url = 'http://localhost:3000/users/blog/' + $routeParams.blogId;                        
    $http.get(url)
        .then(function(res){
            $scope.blog = res.data.blog;          
        }, function(err){
            if(err.data.err.name == 'CastError'){
                alert('Invalid URL');
                window.location = '#!/blogs';
            }
            console.log(err);
        }) 
    $scope.createComment = function(){
        if($rootScope.token == null){
            alert("Please LogIn to comment" );
            window.location = '#!/login';
        }else{
            if($scope.description == undefined){
                alert('Please comment something');
            }else{
                $scope.comment = {};
                $scope.comment.blog_id = $scope.blog._id;
                $scope.comment.token = $rootScope.token;
                $scope.comment.description = $scope.description;
                $http.post('http://localhost:3000/users/createComment', $scope.comment)
                .then(function(res){
                    window.location = '#!/blogs'
                }, function(err){
                    console.log(err);
                    alert("Please LogIn again token corrupted " );
                    window.location = '#!/login';
                })
            }          
        }
    }
    $scope.createBlog = function(){
        if($rootScope.token == null){
            alert("Please LogIn to edit the post" );
            window.location = '#!/login/';
        }else{
            window.location = '#!/editBlog/' + $routeParams.blogId;
        }
    }
}]);
blogMod.controller('blogsCtrl', ['$http', '$scope', '$rootScope', function($http, $scope, $rootScope){
    $http.get('http://127.0.0.1:3000/users/getAllBlogs' )
        .then(function(blogs){
            $rootScope.blogs = blogs.data.message;
        }, function(err){
            alert('Err' + err);
            console.log(err);
        })
}]);
blogMod.controller('mainCtrl', ['$scope', '$rootScope',function($scope, $rootScope){
    $rootScope.token = null;
    $rootScope.name = null;
    $scope.logIn = function(){
        if($rootScope.token != null){
            //document.getElementById('logInId').innerHTML = '<span class="glyphicon glyphicon-log-in"></span>' + 'LogIn';
            $rootScope.token = null;
            $rootScope.name = null;
            localStorage.clear();
            window.location = '#!/blogs';    
        }else{
            window.location = '#!/login'; 
        }    
    }
    $rootScope.$on('$routeChangeStart', function($event, next, current) { 
        if(localStorage.getItem('token') == null){
           // window.location = '#!/blogs';
        }else{
            $rootScope.token = localStorage.getItem('token');
            $rootScope.name = localStorage.getItem('name');
           // window.location = ''
        }
    });
}]);
blogMod.controller('blog-controller', ['$scope', '$http', function($scope, $http){
    $scope.message = "msg from controller";
    $http.get('public/data/trainings.json')
        .then((data) => {
            //console.log(data);
            $scope.trainings = data;
        })
}]);