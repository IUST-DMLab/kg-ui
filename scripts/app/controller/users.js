app
    .controller('UsersController', function ($scope, RestService, $cookieStore, $mdDialog) {
        $scope.selected = [];
        $scope.limitOptions = [5, 10, 15];

        $scope.options = {
            rowSelection: true,
            multiSelect: true,
            autoSelect: true,
            decapitate: false,
            largeEditDialog: false,
            boundaryLinks: false,
            limitSelect: true,
            pageSelect: true
        };

        $scope.query = {
            name: '',
            username: '',
            order: 'name',
            limit: 5,
            page: 1
        };

        $scope.load = function () {
            let authToken = $cookieStore.get('authToken');

            RestService.getUsers(authToken, $scope.query.name, $scope.query.username)
                .then(function (response) {
                    $scope.data = {
                        users: response.data.data,
                        pageIndex: response.data.page,
                        pageSize: response.data.pageSize,
                        pageCount: response.data.pageCount,
                        totalSize: response.data.totalSize,
                    };
                })
                .catch(function (err) {
                    console.log('error : ', err);
                });
        };

        $scope.edit = function (user) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/users/edit.html',
                parent: angular.element(document.body),
                locals: {
                    user: user
                },
                //targetEvent: ev,
                clickOutsideToClose: true,
            }).then(function (answer) {
                $scope.load();
            }, function () {

            });
        };


        function DialogController($scope, $mdDialog, user) {
            $scope.user = user ? angular.copy(user) : {permissions: []};
            $scope.pExpert = $scope.user.permissions.indexOf('Expert') !== -1;
            $scope.pSuperuser = $scope.user.permissions.indexOf('Superuser') !== -1;
            $scope.pVIPExpert = $scope.user.permissions.indexOf('VIPExpert') !== -1;
            $scope.save = function () {
                let authToken = $cookieStore.get('authToken');
                let permissions = [$scope.pExpert ? 'Expert' : '', $scope.pSuperuser ? 'Superuser' : '', $scope.pVIPExpert ? 'VIPExpert' : ''].filter(p => p);
                $scope.user.permissions = permissions;
                console.log($scope);
                RestService.saveUser(authToken, $scope.user.name, $scope.user.username, permissions, $scope.user.password, $scope.user.identifier)
                    .then(function (response) {
                        $mdDialog.hide('save');
                    })
                    .catch(function (err) {
                        alert(err);
                        console.log('error : ', err);
                    });
            };

            $scope.cancel = function () {
                $mdDialog.hide('cancel');
            };
        }

        //
        $scope.load();
    });