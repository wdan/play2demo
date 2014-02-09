package models

import scala.util.Random

import play.api.libs.json._

case class Node(nodeId: Int){
  val rand = new Random
  val groupId = rand.nextInt(20)
  def group = groupId
  def name = nodeId
  def toDict() = {
    Json.obj(
      "name" -> this.nodeId,
      "group" -> this.groupId
    )
  }
}
