﻿using BuildServer.Interfaces;
using Newtonsoft.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RabbitMQ.Shared.Interfaces;
using RabbitMQ.Shared.ModelsDTO;
using RabbitMQ.Shared.Settings;
using System;
using System.Text;

namespace BuildServer.Services
{
    public class QueueService : IQueueService
    {
        private readonly IMessageProducerScope _messageProducerScopeBuild;
        private readonly IMessageProducerScope _messageProducerScopeRun;
        private readonly IMessageConsumerScope _messageConsumerScopeBuild;
        private readonly IMessageConsumerScope _messageConsumerScopeRun;
        private readonly Worker _worker;

        public QueueService(IMessageProducerScopeFactory messageProducerScopeFactory,
                            IMessageConsumerScopeFactory messageConsumerScopeFactory,
                            IAzureService azureService,
                            IProjectBuilder builder,
                            IFileArchiver fileArchiver)
        {
            
            _messageProducerScopeBuild = messageProducerScopeFactory.Open(new MessageScopeSettings
            {
                ExchangeName = "BuildServerExchangeBuild",
                ExchangeType = ExchangeType.Direct,
                QueueName = "BuildResultQueue",
                RoutingKey = "buildResponse"
            });
            _messageProducerScopeRun = messageProducerScopeFactory.Open(new MessageScopeSettings
            {
                ExchangeName = "BuildServerExchangeRun",
                ExchangeType = ExchangeType.Direct,
                QueueName = "RunResultQueue",
                RoutingKey = "runResponse"
            });

            _messageConsumerScopeRun = messageConsumerScopeFactory.Connect(new MessageScopeSettings
           {
                ExchangeName = "IdeExchangeRun",
                ExchangeType = ExchangeType.Direct,
                QueueName = "SendRunRequestQueue",
                RoutingKey = "runRequest"
            });
            _messageConsumerScopeBuild = messageConsumerScopeFactory.Connect(new MessageScopeSettings
            {
                ExchangeName = "IdeExchangeBuild",
                ExchangeType = ExchangeType.Direct,
                QueueName = "SendBuildRequestQueue",
                RoutingKey = "buildRequest"
            });

            _messageConsumerScopeBuild.MessageConsumer.Received += MessageConsumer_BuildReceived;
            _messageConsumerScopeRun.MessageConsumer.Received += MessageConsumer_RunReceived;
            _worker = new Worker(builder, fileArchiver, azureService);
        }

        private void MessageConsumer_BuildReceived(object sender, BasicDeliverEventArgs evn)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Received Build message");
            var message = Encoding.UTF8.GetString(evn.Body);
            var projectForBuild = JsonConvert.DeserializeObject<ProjectForBuildDTO>(message);
            var projectName = $"project_{projectForBuild.ProjectId}";
            Console.WriteLine($"{projectName} = =========  {projectForBuild.TimeStamp}");
            Console.WriteLine($"language ==> {projectForBuild.Language.ToString()}");
            Console.ForegroundColor = ConsoleColor.White;

            var buildResult = _worker.Build(projectForBuild.UriForProjectDownload, projectName, projectForBuild.Language, out var artifactArchiveUri);

            var resultDTO = new BuildResultDTO()
            {
                ProjectId = projectForBuild.ProjectId,
                WasBuildSucceeded = buildResult.IsSuccess,
                UriForArtifactsDownload = artifactArchiveUri,
                Message = buildResult.Message,
                BuildId = projectForBuild.BuildId
            };
            
            var jsonMessage = JsonConvert.SerializeObject(resultDTO);
            _messageConsumerScopeBuild.MessageConsumer.SetAcknowledge(evn.DeliveryTag, true);
            SendBuildMessage(jsonMessage);
        }

        private void MessageConsumer_RunReceived(object sender, BasicDeliverEventArgs evn)
        {
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.WriteLine("Received Run message");
            var message = Encoding.UTF8.GetString(evn.Body);
            var projectForRun = JsonConvert.DeserializeObject<ProjectForRunDTO>(message);
            var projectName = $"project_{projectForRun.ProjectId}";

            Console.WriteLine($"{projectName} = =========  {projectForRun.TimeStamp}");
            Console.ForegroundColor = ConsoleColor.White;

            var runningResult = _worker.Run(projectForRun.UriForProjectDownload, projectName);
            
            var runResult = new RunResultDTO()
            {
                ProjectId = projectForRun.ProjectId,
                Result = runningResult,
                ConnectionId = projectForRun.ConnectionId
            };

            var jsonMessage = JsonConvert.SerializeObject(runResult);
            _messageConsumerScopeRun.MessageConsumer.SetAcknowledge(evn.DeliveryTag, true);
            SendRunMessage(jsonMessage);
        }

        public bool SendBuildMessage(string value)
        {
            try
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Send build message");
                Console.ForegroundColor = ConsoleColor.White;
                _messageProducerScopeBuild.MessageProducer.Send(value);
                return true;
            }
            catch
            {
                return false;
            }
        }
        public bool SendRunMessage(string value)
        {
            try
            {
                Console.ForegroundColor = ConsoleColor.Blue;
                Console.WriteLine("Send run message");
                Console.ForegroundColor = ConsoleColor.White;
                _messageProducerScopeRun.MessageProducer.Send(value);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public void Dispose()
        {
            _messageProducerScopeBuild.Dispose();
            _messageProducerScopeRun.Dispose();
        }
    }
}
